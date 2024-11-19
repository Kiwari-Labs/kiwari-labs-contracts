import {ethers} from "hardhat";
import {ERC7818NearestExpiryQuery, ERC20EXPBase} from "../../../../constant.test";

export const deployERC7818NearestExpiryQuery = async function (
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era
) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC7818_NEAREST_EXPIRY_QUERY = await ethers.getContractFactory(ERC7818NearestExpiryQuery.name, deployer);

  const erc7818ExpNearestExpiryQuery = await ERC7818_NEAREST_EXPIRY_QUERY.deploy(
    ERC20EXPBase.constructor.name,
    ERC20EXPBase.constructor.symbol,
    blockPeriod,
    frameSize,
    slotSize,
  );

  await erc7818ExpNearestExpiryQuery.deployed();

  return {
    erc7818ExpNearestExpiryQuery,
    deployer,
    alice,
    bob,
    jame,
  };
};
