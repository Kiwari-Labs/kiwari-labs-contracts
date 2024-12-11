import {ethers} from "hardhat";
import {constants, ERC20EXPBase} from "../../../constant.test";

export const deployERC20EXPBase = async function ({
  blockTime = constants.BLOCK_TIME, // 250ms
  windowSize = constants.WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie, dave] = await ethers.getSigners();
  const ERC20EXPBaseContract = await ethers.getContractFactory(ERC20EXPBase.name, deployer);
  const erc20exp = await ERC20EXPBaseContract.deploy(
    ERC20EXPBase.constructor.name,
    ERC20EXPBase.constructor.symbol,
    blockTime,
    windowSize,
  );
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
