import {ethers} from "hardhat";
import {constants, ERC7818SuspendBLSW, ERC20, ERC7818SuspendTLSW} from "../../../../constant.test";
import {MockERC7818SuspendBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";
import {MockERC7818SuspendTLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/TLSW";

export const deployERC7818SuspendSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818SuspendBLSW({blocksPerEpoch, windowSize});
  }

  return await deployERC7818SuspendTLSW({secondsPerEpoch, windowSize});
};

export const deployERC7818SuspendTLSW = async function ({
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_SUSPEND = await ethers.getContractFactory(ERC7818SuspendTLSW.name, deployer);
  const erc7818Suspend = (await ERC7818_SUSPEND.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    secondsPerEpoch,
    windowSize,
  )) as any as MockERC7818SuspendTLSW;
  await erc7818Suspend.waitForDeployment();
  return {
    erc7818Suspend,
    deployer,
    alice,
    bob,
    charlie,
  };
};

export const deployERC7818SuspendBLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_SUSPEND = await ethers.getContractFactory(ERC7818SuspendBLSW.name, deployer);
  const erc7818Suspend = (await ERC7818_SUSPEND.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC7818SuspendBLSW;
  await erc7818Suspend.waitForDeployment();
  return {
    erc7818Suspend,
    deployer,
    alice,
    bob,
    charlie,
  };
};
