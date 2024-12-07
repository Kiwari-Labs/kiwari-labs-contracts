import {ethers} from "hardhat";
import {ERC20EXPBase, common} from "../../../constant.test";

export const deployERC20EXPBase = async function ({
  blockTime = common.blockTime, // 250ms
  windowSize = common.windowSize, // fixed width window size 2 epoch.
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
