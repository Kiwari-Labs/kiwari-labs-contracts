import {ethers} from "hardhat";
import {ERC7818Whitelist, ERC20EXPBase} from "../../../../constant.test";

export const deployERC7818Whitelist = async function (
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era
) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC7818_WHITELIST = await ethers.getContractFactory(ERC7818Whitelist.name, deployer);
  const erc7818expWhitelist = await ERC7818_WHITELIST.deploy(
    ERC20EXPBase.constructor.name,
    ERC20EXPBase.constructor.symbol,
    blockPeriod,
    frameSize,
    slotSize,
  );

  await erc7818expWhitelist.deployed();

  return {
    erc7818expWhitelist,
    deployer,
    alice,
    bob,
    jame,
  };
};
