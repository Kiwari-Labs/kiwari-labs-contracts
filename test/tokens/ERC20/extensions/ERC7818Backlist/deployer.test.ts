import {ethers} from "hardhat";
import {constants, ERC7818BlacklistBLSW, ERC20, ERC7818BlacklistTLSW} from "../../../../constant.test";
import {MockERC7818BlacklistBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";
import {MockERC7818BlacklistTLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/TLSW";

export const deployERC7818BacklistSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818BacklistBLSW({blocksPerEpoch, windowSize});
  }

  return await deployERC7818BacklistTLSW({secondsPerEpoch, windowSize});
};

export const deployERC7818BacklistTLSW = async function ({
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_BACKLIST = await ethers.getContractFactory(ERC7818BlacklistTLSW.name, deployer);
  const erc7818Backlist = (await ERC7818_BACKLIST.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    secondsPerEpoch,
    windowSize,
  )) as any as MockERC7818BlacklistTLSW;
  await erc7818Backlist.waitForDeployment();
  return {
    erc7818Backlist,
    deployer,
    alice,
    bob,
    charlie,
  };
};

export const deployERC7818BacklistBLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_BACKLIST = await ethers.getContractFactory(ERC7818BlacklistBLSW.name, deployer);
  const erc7818Backlist = (await ERC7818_BACKLIST.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC7818BlacklistBLSW;
  await erc7818Backlist.waitForDeployment();
  return {
    erc7818Backlist,
    deployer,
    alice,
    bob,
    charlie,
  };
};
