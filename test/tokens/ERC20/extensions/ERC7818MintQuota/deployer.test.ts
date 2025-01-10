import {ethers} from "hardhat";
import {ERC7818MintQuotaBLSW, constants, ERC20, ERC7818MintQuotaTLSW} from "../../../../constant.test";
import {MockERC7818MintQuotaBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";
import {MockERC7818MintQuotaTLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/TLSW";

export const deployERC7818MintQuotaSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818MintQuotaBLSW({blocksPerEpoch, windowSize});
  }
  return await deployERC7818MintQuotaTLSW({secondsPerEpoch, windowSize});
};

export const deployERC7818MintQuotaTLSW = async function ({
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_MINT_QUOTA = await ethers.getContractFactory(ERC7818MintQuotaTLSW.name, deployer);
  const erc7818MintQuota = (await ERC7818_MINT_QUOTA.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    secondsPerEpoch,
    windowSize,
  )) as any as MockERC7818MintQuotaTLSW;
  await erc7818MintQuota.waitForDeployment();
  return {
    erc7818MintQuota,
    deployer,
    alice,
    bob,
    charlie,
  };
};

export const deployERC7818MintQuotaBLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_MINT_QUOTA = await ethers.getContractFactory(ERC7818MintQuotaBLSW.name, deployer);
  const erc7818MintQuota = (await ERC7818_MINT_QUOTA.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC7818MintQuotaBLSW;
  await erc7818MintQuota.waitForDeployment();
  return {
    erc7818MintQuota,
    deployer,
    alice,
    bob,
    charlie,
  };
};
