import {ethers} from "hardhat";
import {constants, ERC7818PermitBLSW, ERC20, ERC7818PermitTLSW} from "../../../../constant.test";
import {MockERC7818PermitBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";
import {MockERC7818PermitTLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/TLSW";

export const deployERC7818PermitSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818PermitBLSW({blocksPerEpoch, windowSize});
  }

  return await deployERC7818PermitTLSW({secondsPerEpoch, windowSize});
};

export const deployERC7818PermitTLSW = async function ({
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_PERMIT = await ethers.getContractFactory(ERC7818PermitTLSW.name, deployer);
  const erc7818Permit = (await ERC7818_PERMIT.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    secondsPerEpoch,
    windowSize,
  )) as any as MockERC7818PermitTLSW;
  await erc7818Permit.waitForDeployment();
  return {
    erc7818Permit,
    deployer,
    alice,
    bob,
    charlie,
  };
};

export const deployERC7818PermitBLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_PERMIT = await ethers.getContractFactory(ERC7818PermitBLSW.name, deployer);
  const erc7818Permit = (await ERC7818_PERMIT.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC7818PermitBLSW;
  await erc7818Permit.waitForDeployment();
  return {
    erc7818Permit,
    deployer,
    alice,
    bob,
    charlie,
  };
};
