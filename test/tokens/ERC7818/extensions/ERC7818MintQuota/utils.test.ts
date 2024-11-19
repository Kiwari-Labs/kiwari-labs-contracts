import {ethers} from "hardhat";
import {ERC7818MintQuota, ERC7818} from "../../../../constant.test";

export const deployERC7818MintQuota = async function (
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era
) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC7818_MINT_QUOTA = await ethers.getContractFactory(ERC7818MintQuota.name, deployer);

  const erc7818MintQuota = await ERC7818_MINT_QUOTA.deploy(
    ERC7818.constructor.name,
    ERC7818.constructor.symbol,
    blockPeriod,
    frameSize,
    slotSize,
  );

  await erc7818MintQuota.deployed();

  return {
    erc7818MintQuota,
    deployer,
    alice,
    bob,
    jame,
  };
};
