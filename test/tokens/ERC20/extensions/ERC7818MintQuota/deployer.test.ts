import {ethers} from "hardhat";
import {ERC7818MintQuota, ERC20EXPBase} from "../../../../constant.test";

export const deployERC7818MintQuota = async function (
  blockTime = 250,
  windowSize = 2,
) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();

  const ERC7818_MINT_QUOTA = await ethers.getContractFactory(ERC7818MintQuota.name, deployer);

  const erc7818MintQuota = await ERC7818_MINT_QUOTA.deploy(
    ERC20EXPBase.constructor.name,
    ERC20EXPBase.constructor.symbol,
    blockTime,
    windowSize,
  );

  await erc7818MintQuota.waitForDeployment();

  return {
    erc7818MintQuota,
    deployer,
    alice,
    bob,
    charlie,
  };
};
