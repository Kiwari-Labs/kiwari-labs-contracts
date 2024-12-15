import {ethers} from "hardhat";
import {constants, ERC20EXPBase} from "../../../constant.test";
import {calculateSlidingWindowState} from "../../../utils/algorithms/BLSW/deployer.test";
import {MockERC20EXPBase} from "../../../../typechain-types/mocks/contracts/tokens/ERC20";

export const deployERC20EXPBase = async function ({
  blockTime = constants.BLOCK_TIME, // 250ms
  windowSize = constants.WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const self = calculateSlidingWindowState({
    blockTime,
    windowSize,
  });
  const [deployer, alice, bob, charlie, dave] = await ethers.getSigners();
  const ERC20EXPBaseContract = await ethers.getContractFactory(ERC20EXPBase.name, deployer);
  const erc20exp = (await ERC20EXPBaseContract.deploy(
    ERC20EXPBase.constructor.name,
    ERC20EXPBase.constructor.symbol,
    self._blocksPerEpoch,
    self._windowSize,
  )) as any as MockERC20EXPBase;
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
