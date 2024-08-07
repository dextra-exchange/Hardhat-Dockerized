# snapshot manager for the hardhat
Always run the manager from the folder you have the Hardhat installed

To export data to transactions-data.json:

```sh
npx hardhat run snapshot-manager/export-data.js --network local
```

To import data from the transaction-data.json to hardhat blockchain: 

```sh
npx hardhat run snapshot-manager/import-data.js --network local
```
