// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {ethers} from "hardhat";
import {constants, ERC7818BlacklistBLSW, ERC20, ERC7818BlacklistTLSW} from "../../../../constant.test";
import {MockERC7818BlacklistBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/BLSW";
import {MockERC7818BlacklistTLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC20/extensions/TLSW";

export const deployERC7818BlacklistSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7818BlacklistBLSW({blocksPerEpoch, windowSize});
  }

  return await deployERC7818BlacklistTLSW({secondsPerEpoch, windowSize});
};

export const deployERC7818BlacklistTLSW = async function ({
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_BLACKLIST = await ethers.getContractFactory(ERC7818BlacklistTLSW.name, deployer);
  const erc7818Blacklist = (await ERC7818_BLACKLIST.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    secondsPerEpoch,
    windowSize,
  )) as any as MockERC7818BlacklistTLSW;
  await erc7818Blacklist.waitForDeployment();
  return {
    erc7818Blacklist,
    deployer,
    alice,
    bob,
    charlie,
  };
};

export const deployERC7818BlacklistBLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7818_BLACKLIST = await ethers.getContractFactory(ERC7818BlacklistBLSW.name, deployer);
  const erc7818Blacklist = (await ERC7818_BLACKLIST.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC7818BlacklistBLSW;
  await erc7818Blacklist.waitForDeployment();
  return {
    erc7818Blacklist,
    deployer,
    alice,
    bob,
    charlie,
  };
};
