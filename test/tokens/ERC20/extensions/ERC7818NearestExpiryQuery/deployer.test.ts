import {ethers} from "hardhat";
import {constants, ERC7818NearestExpiryQueryBLSW, ERC20, ERC7818NearestExpiryQueryTLSW} from "../../../../constant.test";
import {MockERC7818NearestExpiryQueryBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";
import {MockERC7818NearestExpiryQueryTLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/TLSW";

export const deployERC7818NearestExpiryQuerySelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818NearestExpiryQueryBLSW({blocksPerEpoch, windowSize});
  }

  return await deployERC7818NearestExpiryQueryTLSW({secondsPerEpoch, windowSize});
};

export const deployERC7818NearestExpiryQueryTLSW = async function ({
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_NEAREST_EXPIRY_QUERY = await ethers.getContractFactory(ERC7818NearestExpiryQueryTLSW.name, deployer);
  const erc7818NearestExpiryQuery = (await ERC7818_NEAREST_EXPIRY_QUERY.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    secondsPerEpoch,
    windowSize,
  )) as any as MockERC7818NearestExpiryQueryTLSW;
  await erc7818NearestExpiryQuery.waitForDeployment();
  return {
    erc7818NearestExpiryQuery,
    deployer,
    alice,
    bob,
    charlie,
  };
};

export const deployERC7818NearestExpiryQueryBLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_NEAREST_EXPIRY_QUERY = await ethers.getContractFactory(ERC7818NearestExpiryQueryBLSW.name, deployer);
  const erc7818NearestExpiryQuery = (await ERC7818_NEAREST_EXPIRY_QUERY.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC7818NearestExpiryQueryBLSW;
  await erc7818NearestExpiryQuery.waitForDeployment();
  return {
    erc7818NearestExpiryQuery,
    deployer,
    alice,
    bob,
    charlie,
  };
};
