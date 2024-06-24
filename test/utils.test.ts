import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

import {
  ERC20_EXP_CONTRACT,
  ERC20_EXP_BLOCK_PERIOD,
  ERC20_EXP_EXPIRE_PERIOD,
  ERC20_EXP_NAME,
  ERC20_EXP_SYMBOL,
  LIGHT_WEIGHT_ERC20_EXP_CONTRACT,
  LIGHT_WEIGHT_SLIDING_WINDOW_CONTRACT,
  LIGHT_WEIGHT_SORTED_CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT,
  SORTED_CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT,
  SLIDING_WINDOW_CONTRACT
} from "./constant.test";

const deployERC20Selector = async function (light: boolean) {
  const type = light ? LIGHT_WEIGHT_ERC20_EXP_CONTRACT : ERC20_EXP_CONTRACT;
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC20EXP = await ethers.getContractFactory(
    type,
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
}

const deployDoublyListSelector = async function (light: boolean, autoList: boolean, len: number) {
  const type = light ? LIGHT_WEIGHT_SORTED_CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT : SORTED_CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT;
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const DoublyList = await ethers.getContractFactory(
    type,
    deployer,
  );
  const doublylist = await DoublyList.deploy();
  await doublylist.deployed();

  // To automatically generate the list.
  // [1, 2, 3, ... , 8, 9, 10]
  if (autoList) {
    if (type == LIGHT_WEIGHT_SORTED_CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT) {
      for (let i = 0; i < len; i++) {
        const index = i + 1;
        await doublylist.insert(index);
      }
    } else {
      for (let i = 0; i < len; i++) {
        const index = i + 1;
        const data = padIndexToData(index);
        await doublylist.insert(index, data);
      }
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

const deploySlidingWindowSelector = async function (light: boolean) {
  const type = light ? LIGHT_WEIGHT_SLIDING_WINDOW_CONTRACT : SLIDING_WINDOW_CONTRACT;
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const SlidingWindow = await ethers.getContractFactory(
    type,
    deployer,
  );

  let slidingWindow;
  if (light) {
    // TODO: Load from Constant file.
    slidingWindow = await SlidingWindow.deploy(4, 4, 4);
  } else {
    // TODO: Load from Constant file.
    slidingWindow = await SlidingWindow.deploy(4, 4, 4);
  }

  await slidingWindow.deployed();

  return {
    slidingWindow,
    deployer,
    alice,
    bob,
    jame,
  };
};

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
  return deployERC20Selector(false);
};

export const deployLightWeightERC20EXP = async function () {
  return deployERC20Selector(true);
};

export const deployLightWeightDoublyList = async function ({ autoList = false, len = 10 } = {}) {
  return deployDoublyListSelector(true, autoList, len);
};

export const deployDoublyList = async function ({ autoList = false, len = 10 } = {}) {
  return deployDoublyListSelector(false, autoList, len);
};

export const deployLightWeightSlidingWindow = async function () {
  return deploySlidingWindowSelector(true);
}

export const deploySlidingWindow = async function () {
  return deploySlidingWindowSelector(false);
};


