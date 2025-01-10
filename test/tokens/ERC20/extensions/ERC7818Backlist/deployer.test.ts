import {ethers} from "hardhat";
import {ERC20BLSW, constants, ERC7818BlacklistBLSW} from "../../../../constant.test";
import {MockERC7818BlacklistBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";

export const deployERC7818BacklistSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818Backlist({blocksPerEpoch, windowSize});
  }

  return await deployERC7818Backlist({blocksPerEpoch, windowSize});
};

export const deployERC7818Backlist = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_BACKLIST = await ethers.getContractFactory(ERC7818BlacklistBLSW.name, deployer);
  const erc7818Backlist = (await ERC7818_BACKLIST.deploy(
    ERC20BLSW.constructor.name,
    ERC20BLSW.constructor.symbol,
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
