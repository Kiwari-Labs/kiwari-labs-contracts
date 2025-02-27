// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {ethers} from "hardhat";
import {constants, ERC721, ERC721BLSW, ERC721TLSW} from "../../../constant.test";
import {MockERC721BLSW, MockERC721TLSW} from "../../../../typechain-types/mocks/contracts/tokens/ERC721";

export const deployERC721Selector = async function ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED} = {}) {
  if (epochType === constants.EPOCH_TYPE.BLOCKS_BASED) {
    return await deployERC721BLSW({});
  }
  return await deployERC721TLSW({});
};

export const deployERC721TLSW = async function ({} = {}) {
  const [deployer, alice, bob, charlie, dave] = await ethers.getSigners();
  const ERC721TLSWContract = await ethers.getContractFactory(ERC721TLSW.name, deployer);
  const erc721exp = (await ERC721TLSWContract.deploy(ERC721.constructor.name, ERC721.constructor.symbol)) as any as MockERC721TLSW;
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

export const deployERC721BLSW = async function ({} = {}) {
  const [deployer, alice, bob, charlie, dave] = await ethers.getSigners();
  const ERC20BLSWContract = await ethers.getContractFactory(ERC721BLSW.name, deployer);
  const erc721exp = (await ERC20BLSWContract.deploy(ERC721.constructor.name, ERC721.constructor.symbol)) as any as MockERC721BLSW;
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
