import {ethers} from "hardhat";
import {ERC7818Backlist, ERC20EXPBase, constants} from "../../../../constant.test";

export const deployERC7818Backlist = async function (
  blockTime = constants.BLOCK_TIME,
  windowSize = constants.WINDOW_SIZE,
) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();

  const ERC7818_BACKLIST = await ethers.getContractFactory(ERC7818Backlist.name, deployer);

  const erc7818Backlist = await ERC7818_BACKLIST.deploy(
    ERC20EXPBase.constructor.name,
    ERC20EXPBase.constructor.symbol,
    blockTime,
    windowSize,
  );

  await erc7818Backlist.waitForDeployment();

  return {
    erc7818Backlist,
    deployer,
    alice,
    bob,
    charlie,
  };
};
