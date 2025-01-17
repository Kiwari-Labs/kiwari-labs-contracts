// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {ethers} from "hardhat";
import {constants, ERC20, ERC20BLSW, ERC20TLSW} from "../../../constant.test";
import {MockERC20BLSW, MockERC20TLSW} from "../../../../typechain-types/mocks/contracts/tokens/ERC20";

export const deployERC20Selector = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks.
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
  epochType = constants.EPOCH_TYPE.BLOCKS_BASED,
} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC20BLSW({blocksPerEpoch, windowSize});
  }
  return await deployERC20TLSW({secondsPerEpoch, windowSize});
};

export const deployERC20TLSW = async function ({
  secondsPerEpoch = constants.DEFAULT_SECONDS_PER_EPOCH, // 3_600 seconds.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie, dave] = await ethers.getSigners();
  const ERC20TLSWContract = await ethers.getContractFactory(ERC20TLSW.name, deployer);
  const erc20exp = (await ERC20TLSWContract.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    secondsPerEpoch,
    windowSize,
  )) as any as MockERC20TLSW;
  await erc20exp.waitForDeployment();
  return {
    erc20exp,
    deployer,
    alice,
    bob,
    charlie,
    dave,
  };
};

export const deployERC20BLSW = async function ({
  blocksPerEpoch = constants.DEFAULT_BLOCKS_PER_EPOCH, // 300 blocks.
  windowSize = constants.DEFAULT_WINDOW_SIZE, // fixed width window size 2 epoch.
} = {}) {
  const [deployer, alice, bob, charlie, dave] = await ethers.getSigners();
  const ERC20BLSWContract = await ethers.getContractFactory(ERC20BLSW.name, deployer);
  const erc20exp = (await ERC20BLSWContract.deploy(
    ERC20.constructor.name,
    ERC20.constructor.symbol,
    blocksPerEpoch,
    windowSize,
  )) as any as MockERC20BLSW;
  await erc20exp.waitForDeployment();
  return {
    erc20exp,
    deployer,
    alice,
    bob,
    charlie,
    dave,
  };
};
