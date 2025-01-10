import {ethers} from "hardhat";
import {ERC7818MintQuotaBLSW, ERC20BLSW, constants} from "../../../../constant.test";
import {MockERC7818MintQuotaBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";

export const deployERC7818MintQuotaSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818MintQuota({blocksPerEpoch, windowSize});
  }

  return await deployERC7818MintQuota({blocksPerEpoch, windowSize});
};

export const deployERC7818MintQuota = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_MINT_QUOTA = await ethers.getContractFactory(ERC7818MintQuotaBLSW.name, deployer);
  const erc7818MintQuota = (await ERC7818_MINT_QUOTA.deploy(
    ERC20BLSW.constructor.name,
    ERC20BLSW.constructor.symbol,
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
