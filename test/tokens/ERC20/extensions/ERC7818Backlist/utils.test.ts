import {ethers} from "hardhat";
import {ERC7818Backlist, ERC7818} from "../../../../constant.test";

export const deployERC20EXBacklist = async function (
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era
) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC20_EXP_BACKLIST = await ethers.getContractFactory(ERC7818Backlist.name, deployer);

  const erc20ExpBacklist = await ERC20_EXP_BACKLIST.deploy(
    ERC7818.constructor.name,
    ERC7818.constructor.symbol,
    blockPeriod,
    frameSize,
    slotSize,
  );

  await erc20ExpBacklist.deployed();

  return {
    erc20ExpBacklist,
    deployer,
    alice,
    bob,
    jame,
  };
};
