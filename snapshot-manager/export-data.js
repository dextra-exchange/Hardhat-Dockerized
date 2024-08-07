// scripts/export-transactions.js

const fs = require('fs');
const { ethers } = require('hardhat');

async function main() {
  const provider = ethers.provider;

  // Get the latest block number
  const latestBlockNumber = await provider.getBlockNumber();
  console.log(`Latest Block Number: ${latestBlockNumber}`);

  // Array to hold transaction data
  const transactions = [];

  // Loop through all blocks and collect transactions
  for (let blockNumber = 0; blockNumber <= latestBlockNumber; blockNumber++) {
    console.log(`Processing Block Number: ${blockNumber}`);
    const block = await provider.getBlock(blockNumber);

    if (block && block.transactions) {
      // Fetch each transaction
      for (const txHash of block.transactions) {
        try {
          const tx = await provider.getTransaction(txHash);

          // Add transaction details to the array
          transactions.push({
            blockNumber: block.number,
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value.toString(),
            gasPrice: tx.gasPrice ? tx.gasPrice.toString() : null,
            gasLimit: tx.gasLimit.toString(),
            nonce: tx.nonce,
            data: tx.data
          });
        } catch (error) {
          console.error(`Failed to fetch transaction ${txHash}:`, error);
        }
      }
    }
  }

  // Save to file
  fs.writeFileSync('transactions-data.json', JSON.stringify(transactions, null, 2));
  console.log('Transaction data exported to transactions-data.json');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
