require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
   	chainId: 1337,
        initialBaseFeePerGas: 90000, // 1 gwei (adjust as needed)
        gasPrice: 20000000000, // 20 gwei (adjust as needed)
      // Optionally set block gas limit if required
      //blockGasLimit: 10000000,
  }
 }
};
