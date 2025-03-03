// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {ethers} from "hardhat";
import {constants, ERC721, ERC7858EpochBLSW, ERC7858EpochTLSW} from "../../../../constant.test";
import {MockERC7858EpochBLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC721/extensions/BLSW";
import {MockERC7858EpochTLSW} from "../../../../../typechain-types/mocks/contracts/tokens/ERC721/extensions/TLSW";

export const deployERC7858EpochSelector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7858EpochBLSW({blocksPerEpoch, windowSize});
  }

  return await deployERC7858EpochTLSW({secondsPerEpoch, windowSize});
};

export const deployERC7858EpochTLSW = async function ({
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7858_EPOCH = await ethers.getContractFactory(ERC7858EpochTLSW.name, deployer);
  const erc7858Epoch = (await ERC7858_EPOCH.deploy(
    ERC721.constructor.name,
    ERC721.constructor.symbol,
    secondsPerEpoch,
    windowSize,
  )) as any as MockERC7858EpochTLSW;
  await erc7858Epoch.waitForDeployment();
  return {
    erc7858Epoch,
    deployer,
    alice,
    bob,
    charlie,
  };
};

export const deployERC7858EpochBLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const ERC7858_EPOCH = await ethers.getContractFactory(ERC7858EpochBLSW.name, deployer);
  const erc7858Epoch = (await ERC7858_EPOCH.deploy(
    ERC721.constructor.name,
    ERC721.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC7858EpochBLSW;
  await erc7858Epoch.waitForDeployment();
  return {
    erc7858Epoch,
    deployer,
    alice,
    bob,
    charlie,
  };
};
