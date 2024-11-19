import {ethers} from "hardhat";
import {ERC7818Backlist, ERC20EXPBase} from "../../../../constant.test";

export const deployERC7818Backlist = async function (
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era
) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC7818_BACKLIST = await ethers.getContractFactory(ERC7818Backlist.name, deployer);

  const erc7818Backlist = await ERC7818_BACKLIST.deploy(
    ERC20EXPBase.constructor.name,
    ERC20EXPBase.constructor.symbol,
    blockPeriod,
    frameSize,
    slotSize,
  );

  await erc7818Backlist.deployed();

  return {
    erc7818Backlist,
    deployer,
    alice,
    bob,
    jame,
  };
};
