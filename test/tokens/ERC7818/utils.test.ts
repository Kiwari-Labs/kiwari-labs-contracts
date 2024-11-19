import {ethers} from "hardhat";
import {ERC7818} from "../../constant.test";

export const deployERC7818 = async function ({
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era}
}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC7818Contract = await ethers.getContractFactory(ERC7818.name, deployer);
  const erc7818 = await ERC7818Contract.deploy(
    ERC7818.constructor.name,
    ERC7818.constructor.symbol,
    blockPeriod,
    frameSize,
    slotSize,
  );

  await erc7818.deployed();

  return {
    erc7818,
    deployer,
    alice,
    bob,
    jame,
  };
};
