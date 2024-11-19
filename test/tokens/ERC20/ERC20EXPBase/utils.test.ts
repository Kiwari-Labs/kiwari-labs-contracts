import {ethers} from "hardhat";
import {ERC20EXPBase} from "../../../constant.test";

export const deployERC20EXPBase = async function ({
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era}
} = {}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC20EXPBaseContract = await ethers.getContractFactory(ERC20EXPBase.name, deployer);
  const erc20exp = await ERC20EXPBaseContract.deploy(
    ERC20EXPBase.constructor.name,
    ERC20EXPBase.constructor.symbol,
    blockPeriod,
    frameSize,
    slotSize,
  );

  await erc20exp.deployed();

  return {
    erc20exp,
    deployer,
    alice,
    bob,
    jame,
  };
};
