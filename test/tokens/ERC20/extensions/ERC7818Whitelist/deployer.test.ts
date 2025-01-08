import {ethers} from "hardhat";
import {ERC7818Whitelist, ERC20EXPBase, constants} from "../../../../constant.test";

export const deployERC7818Whitelist = async function (blockTime = constants.BLOCK_TIME, windowSize = constants.WINDOW_SIZE) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();

  const ERC7818_WHITELIST = await ethers.getContractFactory(ERC7818Whitelist.name, deployer);
  const erc7818expWhitelist = await ERC7818_WHITELIST.deploy(
    ERC20EXPBase.constructor.name,
    ERC20EXPBase.constructor.symbol,
    blockTime,
    windowSize,
  );

  await erc7818expWhitelist.waitForDeployment();

  return {
    erc7818expWhitelist,
    deployer,
    alice,
    bob,
    charlie,
  };
};
