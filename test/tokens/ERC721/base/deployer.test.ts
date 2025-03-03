// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {ethers} from "hardhat";
import {constants, ERC721, ERC7858BLSW, ERC7858TLSW} from "../../../constant.test";
import {MockERC7858BLSW, MockERC7858TLSW} from "../../../../typechain-types/mocks/contracts/tokens/ERC721";

export const deployERC7858Selector = async function ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC7858BLSW({});
  }
  return await deployERC7858TLSW({});
};

export const deployERC7858TLSW = async function ({} = {}) {
  const [deployer, alice, bob, charlie, dave] = await ethers.getSigners();
  const ERC721TLSWContract = await ethers.getContractFactory(ERC7858TLSW.name, deployer);
  const erc721exp = (await ERC721TLSWContract.deploy(ERC721.constructor.name, ERC721.constructor.symbol)) as any as MockERC7858TLSW;
  await erc721exp.waitForDeployment();
  return {
    erc721exp,
    deployer,
    alice,
    bob,
    charlie,
    dave,
  };
};

export const deployERC7858BLSW = async function ({} = {}) {
  const [deployer, alice, bob, charlie, dave] = await ethers.getSigners();
  const ERC20BLSWContract = await ethers.getContractFactory(ERC7858BLSW.name, deployer);
  const erc721exp = (await ERC20BLSWContract.deploy(ERC721.constructor.name, ERC721.constructor.symbol)) as any as MockERC7858BLSW;
  await erc721exp.waitForDeployment();
  return {
    erc721exp,
    deployer,
    alice,
    bob,
    charlie,
    dave,
  };
};
