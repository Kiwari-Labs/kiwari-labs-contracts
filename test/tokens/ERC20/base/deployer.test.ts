import {ethers} from "hardhat";
import {constants, ERC20BLSW} from "../../../constant.test";
import {MockERC20BLSW} from "../../../../typechain-types/mocks/contracts/tokens/ERC20";

export const deployERC20Selector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC20BLSW({blocksPerEpoch, windowSize});
  }

  return await deployERC20BLSW({blocksPerEpoch, windowSize});
};

export const deployERC20BLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie, dave] = await ethers.getSigners();
  const ERC20BLSWContract = await ethers.getContractFactory(ERC20BLSW.name, deployer);
  const erc20exp = (await ERC20BLSWContract.deploy(
    ERC20BLSW.constructor.name,
    ERC20BLSW.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC20BLSW;
  await erc20exp.waitForDeployment();
  return {
    erc20exp,
    deployer,
    alice,
    bob,
    charlie,
    dave,
  };
};
