import click
import os
from pathlib import Path
import json
from web3 import Web3
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

def get_nonce(address):
    w3.eth.get_transaction_count(address)
#@click.option('--network', default="localhost", help='Hardhat network')
#@click.option('--name', prompt='Your name',
#              help='The person to greet.')

@click.group()
def cli():
    pass

def fix_blocknumbers(data)->list:
    for x in range(len(data)):
        data[x]["blockNumber"] = x+1
        data[x]["nonce"] = get_nonce(data[x]["from"])
    return data


@click.command()
@click.option('--network', default="localhost", help='Hardhat network')
def backup(network: str):
    print(f"Creating backup of hardhat node at: {network}")
    old_tr_data = False
    if Path("transactions-data.json").exists():
        print("Keeping the old transactions-data.json file")
        old_tr_data = True
        os.rename("transactions-data.json", "transactions-data.json.old")
    os.system(f"npx hardhat run snapshot-manager/export-data.js --network {network}")
    print("Merging new and old transactions-data.json")

    if old_tr_data:
        all_tr = []
        old_tr = None
        with open("transactions-data.json.old","r") as tr_data_old:
            old_tr = json.load(tr_data_old)
        new_tr = None
        with open("transactions-data.json", "r") as tr_data:
            new_tr = json.load(tr_data)

        for tr in old_tr:
            if tr["data"] == "0x":
                print("appending")
                all_tr.append(tr)

        all_tr += new_tr
        all_tr = fix_blocknumbers(all_tr)
        with open("transactions-data.json", "w") as tr_data:
            data = json.dumps(all_tr, indent=4)
            tr_data.write(str(data))
        print("Removing old data")
        os.remove("transactions-data.json.old")
        print("Blockchain backup completed")





@click.command()
@click.option('--network', default="localhost", help='Hardhat network')
def restore(network):
    print(f"Restoring backup of hardhat node from transactions-data.json at: {network}")
    os.system(f"npx hardhat run snapshot-manager/import-data.js --network {network}")
    print("Blockchain restored")

if __name__ == '__main__':
    cli.add_command(backup)
    cli.add_command(restore)
    cli()
