import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

import {
  CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT,
  ERC20_EXP_CONTRACT,
  ERC20_EXP_BLOCK_PERIOD,
  ERC20_EXP_EXPIRE_PERIOD,
  ERC20_EXP_NAME,
  ERC20_EXP_SYMBOL,
} from "./constant.test";

export const getAddress = async function (account: Signer | Contract) {
  if (account instanceof Contract) {
    return account.address.toLowerCase();
  }
  return (await account.getAddress()).toLowerCase();
};

export const deployERC20EXP = async function () {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC20EXP = await ethers.getContractFactory(
    ERC20_EXP_CONTRACT,
    deployer,
  );
  const erc20exp = await ERC20EXP.deploy(
    ERC20_EXP_NAME,
    ERC20_EXP_SYMBOL,
    ERC20_EXP_BLOCK_PERIOD,
    ERC20_EXP_EXPIRE_PERIOD,
  );
  await erc20exp.deployed();

  return {
    erc20exp,
    deployer,
    alice,
    bob,
    jame,
  };
};

export const deployDoublyList = async function () {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const DoublyList = await ethers.getContractFactory(
    CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT,
    deployer,
  );

  const doublylist = await DoublyList.deploy();
  await doublylist.deployed();

  return {
    doublylist,
    deployer,
    alice,
    bob,
    jame,
  };
};
