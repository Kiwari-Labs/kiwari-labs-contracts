import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "hardhat-deploy";

import { HardhatUserConfig } from "hardhat/types";
import path from "path";
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: path.resolve(__dirname, "./.env") });

import glob from "glob";
import { subtask } from "hardhat/config";
import { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } from "hardhat/builtin-tasks/task-names";

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const CUSTOM_RPC = process.env.CUSTOM_RPC || "";
const CUSTOM_CHAIN_ID = Number(process.env.CUSTOM_CHAIN_ID) || 1337;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      gas: "auto",
      gasPrice: 9000000000,
      blockGasLimit: 0x1fffffffffffff
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: WALLET_PRIVATE_KEY ? [`0x${WALLET_PRIVATE_KEY}`] : [],
    },
    custom: {
      url: CUSTOM_RPC,
      chainId: CUSTOM_CHAIN_ID,
      accounts: WALLET_PRIVATE_KEY ? [`0x${WALLET_PRIVATE_KEY}`] : [],
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 384,
      },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
  },
};

subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS, async (_, { config }) => {
  const mainContracts = glob.sync(
    path.join(config.paths.root, "contracts/**/*.sol"),
  );
  const testContracts = glob.sync(
    path.join(config.paths.root, "test/**/*.sol"),
  );

  return [...mainContracts, ...testContracts].map(path.normalize);
});

export default config;
