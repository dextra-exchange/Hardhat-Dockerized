// scripts/import-transactions.js

const fs = require('fs');
const { ethers } = require('hardhat');
const provider = ethers.provider;
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer address:", deployer.address);

  // Load the exported transaction data
  const transactions = JSON.parse(fs.readFileSync('transactions-data.json', 'utf8'));

  // Track the transaction status
  let successCount = 0;
  let failureCount = 0;
  let nonce = 0;
  // Import transactions
  for (const tx of transactions) {
    // Prepare transaction object with default values if fields are missing
    if(nonce === 0){
      nonce = await provider.getTransactionCount(tx.from);
    }
    const txObject = {
      nonce: nonce,
      gasLimit: BigInt(tx.gasLimit || '21000'), // Default gas limit if missing
      gasPrice: tx.gasPrice ? BigInt(tx.gasPrice) : undefined,
      to: tx.to,
      value: BigInt(tx.value || '0'), // Default value if missing
      data: tx.data || '0x', // Default empty data if missing
    };
    nonce+=1;
    try {
      console.log(`Sending transaction ${tx.hash}`);

      // Send the transaction using the deployer
      const txResponse = await deployer.sendTransaction(txObject);
      console.log(`Transaction ${tx.hash} sent: ${txResponse.hash}`);

      // Wait for the transaction to be mined
      await txResponse.wait();
      console.log(`Transaction ${tx.hash} confirmed.`);

      successCount++;
    } catch (error) {
      console.error(`Failed to send transaction ${tx.hash}:`, error);
      failureCount++;
    }
  }

  console.log(`Import complete. Successes: ${successCount}, Failures: ${failureCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
