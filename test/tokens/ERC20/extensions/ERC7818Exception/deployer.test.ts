import {ethers} from "hardhat";
import {ERC20, constants, ERC7818ExceptionBLSW, ERC7818ExceptionTLSW} from "../../../../constant.test";
import {MockERC7818ExceptionBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";
import {MockERC7818ExceptionTLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/TLSW";

export const deployERC7818ExceptionSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818ExceptionBLSW({blocksPerEpoch, windowSize});
  }
  return await deployERC7818ExceptionTLSW({secondsPerEpoch, windowSize});
};

export const deployERC7818ExceptionTLSW = async function ({
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_WHITELIST = await ethers.getContractFactory(ERC7818ExceptionTLSW.name, deployer);
  const erc7818expException = (await ERC7818_WHITELIST.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    secondsPerEpoch,
    windowSize,
  )) as any as MockERC7818ExceptionTLSW;
  await erc7818expException.waitForDeployment();
  return {
    erc7818expException,
    deployer,
    alice,
    bob,
    charlie,
  };
};

export const deployERC7818ExceptionBLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_WHITELIST = await ethers.getContractFactory(ERC7818ExceptionBLSW.name, deployer);
  const erc7818expException = (await ERC7818_WHITELIST.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC7818ExceptionBLSW;
  await erc7818expException.waitForDeployment();
  return {
    erc7818expException,
    deployer,
    alice,
    bob,
    charlie,
  };
};
