import {ethers} from "hardhat";
import {ERC20, constants, ERC7818WhitelistBLSW, ERC7818WhitelistTLSW} from "../../../../constant.test";
import {MockERC7818WhitelistBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";
import {MockERC7818WhitelistTLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/TLSW";

export const deployERC7818WhitelistSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818WhitelistBLSW({blocksPerEpoch, windowSize});
  }
  return await deployERC7818WhitelistTLSW({secondsPerEpoch, windowSize});
};

export const deployERC7818WhitelistTLSW = async function ({
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_WHITELIST = await ethers.getContractFactory(ERC7818WhitelistTLSW.name, deployer);
  const erc7818expWhitelist = (await ERC7818_WHITELIST.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    secondsPerEpoch,
    windowSize,
  )) as any as MockERC7818WhitelistTLSW;
  await erc7818expWhitelist.waitForDeployment();
  return {
    erc7818expWhitelist,
    deployer,
    alice,
    bob,
    charlie,
  };
};

export const deployERC7818WhitelistBLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_WHITELIST = await ethers.getContractFactory(ERC7818WhitelistBLSW.name, deployer);
  const erc7818expWhitelist = (await ERC7818_WHITELIST.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC7818WhitelistBLSW;
  await erc7818expWhitelist.waitForDeployment();
  return {
    erc7818expWhitelist,
    deployer,
    alice,
    bob,
    charlie,
  };
};
