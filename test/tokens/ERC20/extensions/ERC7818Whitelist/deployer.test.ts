import {ethers} from "hardhat";
import {ERC20BLSW, constants, ERC7818WhitelistBLSW} from "../../../../constant.test";
import {MockERC7818WhitelistBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";

export const deployERC7818WhitelistSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818Whitelist({blocksPerEpoch, windowSize});
  }

  return await deployERC7818Whitelist({blocksPerEpoch, windowSize});
};

export const deployERC7818Whitelist = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_WHITELIST = await ethers.getContractFactory(ERC7818WhitelistBLSW.name, deployer);
  const erc7818expWhitelist = (await ERC7818_WHITELIST.deploy(
    ERC20BLSW.constructor.name,
    ERC20BLSW.constructor.symbol,
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
