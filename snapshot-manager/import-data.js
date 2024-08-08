const fs = require('fs');
const { ethers, network } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer address:", deployer.address);

  // Load the transaction data from the JSON file
  const transactions = JSON.parse(fs.readFileSync('transactions-data.json', 'utf8'));

  // Track the transaction status
  let successCount = 0;
  let failureCount = 0;

  for (const tx of transactions) {
    try {
      const provider = ethers.provider;

      // Check if the transaction is a simple Ether transfer (data field is "0x")
      if (tx.data === "0x") {
        // Handle raw Ether transfer by adjusting balances
        const recipientBalance = await provider.getBalance(tx.to);
        const newRecipientBalance = recipientBalance + BigInt(tx.value);

        await network.provider.send("hardhat_setBalance", [
          tx.to,
          ethers.toQuantity(newRecipientBalance)
        ]);

        console.log(`Set balance of ${tx.to} to ${newRecipientBalance.toString()}`);

        // Burn the amount from the sender's account
        const senderBalance = await provider.getBalance(tx.from);
        const gasCost = BigInt(tx.gasLimit) * BigInt(tx.gasPrice);
        const totalCost = BigInt(tx.value) + gasCost;
        const newSenderBalance = senderBalance -totalCost;

        if (newSenderBalance < 0) {
          throw new Error(`Insufficient balance in sender account ${tx.from} to cover the transaction cost`);
        }

        await network.provider.send("hardhat_setBalance", [
          tx.from,
          ethers.toQuantity(newSenderBalance)
        ]);

        console.log(`Reduced balance of ${tx.from} by ${totalCost.toString()}`);
      } else {
        // Handle smart contract interactions by replaying the transaction
        const txObject = {
          nonce: tx.nonce,
          gasLimit: BigInt(tx.gasLimit),
          gasPrice: BigInt(tx.gasPrice),
          to: tx.to,
          value: BigInt(tx.value),
          data: tx.data, // Include the data field for contract interactions
        };

        const txResponse = await deployer.sendTransaction(txObject);
        console.log(`Transaction ${tx.hash} sent: ${txResponse.hash}`);

        // Wait for the transaction to be mined
        await txResponse.wait();
        console.log(`Transaction ${tx.hash} confirmed.`);
      }

      successCount++;
    } catch (error) {
      console.error(`Failed to process transaction ${tx.hash}:`, error);
      failureCount++;
    }
  }

  console.log(`Import complete. Successes: ${successCount}, Failures: ${failureCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
