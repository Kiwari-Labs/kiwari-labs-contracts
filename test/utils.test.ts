import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

import {
  CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT,
  ERC20_EXP_CONTRACT,
  ERC20_EXP_BLOCK_PERIOD,
  ERC20_EXP_EXPIRE_PERIOD,
  ERC20_EXP_NAME,
  ERC20_EXP_SYMBOL,
  SLIDING_WINDOW_CONTRACT
} from "./constant.test";

export const padIndexToData = function (index: Number) {
  // The padding is applied from the start of this string (output: 0x0001).
  return `0x${index.toString().padStart(4, "0")}`;
};

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

export const deployDoublyList = async function ({ autoList = false, len = 10 } = {}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const DoublyList = await ethers.getContractFactory(
    CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT,
    deployer,
  );

  const doublylist = await DoublyList.deploy();
  await doublylist.deployed();

  // To automatically generate the list.
  // [1, 2, 3, ... , 8, 9, 10]
  if (autoList) {
    for (let i = 0; i < len; i++) {
      const index = i + 1;
      const data = padIndexToData(index);
      await doublylist.insert(index, data);
    }
  }

  return {
    doublylist,
    deployer,
    alice,
    bob,
    jame,
  };
};

// export deploySlidingWindow = async function () {}
