import {Contract, Signer} from "ethers";
import {ethers} from "hardhat";
import {mine, time} from "@nomicfoundation/hardhat-network-helpers";

import {
  ERC20_EXP_WHITELIST_CONTRACT,
  ERC20_EXP_BLOCK_PERIOD,
  ERC20_EXP_NAME,
  ERC20_EXP_SYMBOL,
  LIGHT_WEIGHT_ERC20_EXP_WHITELIST_CONTRACT,
  LIGHT_WEIGHT_SLIDING_WINDOW_CONTRACT,
  LIGHT_WEIGHT_SORTED_CIRCULAR_DOUBLY_LINKED_LIST_LIBRARY_CONTRACT,
  SORTED_CIRCULAR_DOUBLY_LINKED_LIST_LIBRARY_CONTRACT,
  SLIDING_WINDOW_CONTRACT,
  SlidingWindowState,
  YEAR_IN_MILLISECONDS,
  LightWeightSlidingWindowState,
  TWO_BITS,
  SLOT_PER_ERA,
  THREE_BITS,
  ERC20_EXP_EXPIRE_PERIOD,
  LIGHT_WEIGHT_ERC20_EXP_BASE_CONTRACT,
  ERC20_EXP_BASE_CONTRACT,
  LIGHT_WEIGHT_SLIDING_WINDOW_LIBRARY_CONTRACT,
  SLIDING_WINDOW_LIBRARY_CONTRACT,
} from "./constant.test";

// tools
export const latestBlock = async function () {
  return await time.latestBlock();
};

export const mineBlock = async function (blocks: number = 1, options: {interval?: number} = {}) {
  await mine(blocks, options);
};

export const skipToBlock = async function (target: number) {
  await mine(target - (await time.latestBlock()));
};

export const padIndexToData = function (index: Number) {
  // The padding is applied from the start of this string (output: 0x0001).
  return `0x${index.toString().padStart(4, "0")}`;
};

export const calculateLightWeightSlidingWindowState = function ({
  startBlockNumber = 100,
  blockPeriod = 400,
  frameSize = 2,
}): LightWeightSlidingWindowState {
  const self: LightWeightSlidingWindowState = {
    _blockPerEra: 0,
    _blockPerSlot: 0,
    _frameSizeInBlockLength: 0,
    _frameSizeInEraAndSlotLength: [],
    _startBlockNumber: 0,
  };

  self._startBlockNumber = startBlockNumber;

  // Why 'Math.floor', Since Solidity always rounds down.
  const blockPerSlotCache = Math.floor(YEAR_IN_MILLISECONDS / blockPeriod) >> TWO_BITS;
  // Assume block per year equal to 78892315.
  // Convert 78892315 into its binary: 100101110011010011011111011
  // Shift the bits to the right by 2 positions: 100101110011010011011111011 >> 2
  // After shifting: 001001011100110100110111110
  // Convert this binary number back to decimal: 19723078
  // This is because shifting 78892315 to the right by 2 bits
  // results in 19723078, which is the floor value of 78892315 / 4.
  const blockPerEraCache = blockPerSlotCache << TWO_BITS;

  self._blockPerEra = blockPerEraCache;
  self._blockPerSlot = blockPerSlotCache;
  self._frameSizeInBlockLength = blockPerSlotCache * frameSize;
  if (frameSize <= SLOT_PER_ERA) {
    self._frameSizeInEraAndSlotLength[0] = 0;
    self._frameSizeInEraAndSlotLength[1] = frameSize;
  } else {
    // Assume frame size equal to 2.
    // The number 2 in binary is [10].
    // Shifting [10] to the right by 2 positions results is [00].
    // Convert this binary number back to decimal: 0
    self._frameSizeInEraAndSlotLength[0] = frameSize >> TWO_BITS;
    // The number 2 in binary is 10.
    // The number 3 in binary is 11.
    // The binary result of 2 & 3 is 10, which is 2 in decimal.
    self._frameSizeInEraAndSlotLength[1] = frameSize & THREE_BITS;
  }

  return self;
};

export const calculateSlidingWindowState = function ({
  startBlockNumber = 100,
  blockPeriod = 400,
  frameSize = 2,
  slotSize = 4,
}): SlidingWindowState {
  const self: SlidingWindowState = {
    _blockPerEra: 0,
    _blockPerSlot: 0,
    _frameSizeInBlockLength: 0,
    _frameSizeInEraAndSlotLength: [],
    _slotSize: 0,
    _startBlockNumber: 0,
  };

  self._startBlockNumber = startBlockNumber;

  // Why 'Math.floor', Since Solidity always rounds down.
  const blockPerSlotCache = Math.floor(Math.floor(YEAR_IN_MILLISECONDS / blockPeriod) / slotSize);
  const blockPerEraCache = blockPerSlotCache * slotSize;

  self._blockPerEra = blockPerEraCache;
  self._blockPerSlot = blockPerSlotCache;
  self._frameSizeInBlockLength = blockPerSlotCache * frameSize;
  self._slotSize = slotSize;
  if (frameSize <= slotSize) {
    self._frameSizeInEraAndSlotLength[0] = 0;
    self._frameSizeInEraAndSlotLength[1] = frameSize;
  } else {
    self._frameSizeInEraAndSlotLength[0] = frameSize / slotSize;
    self._frameSizeInEraAndSlotLength[1] = frameSize % slotSize;
  }

  return self;
};

export const getAddress = async function (account: Signer | Contract) {
  if (account instanceof Contract) {
    return account.address.toLowerCase();
  }
  return (await account.getAddress()).toLowerCase();
};

// abstracts

const deploySlidingWindowSelector = async function (
  light: boolean,
  startBlockNumber: number,
  blockPeriod: number,
  frameSize: number,
  slotSize?: number,
) {
  const type = light ? LIGHT_WEIGHT_SLIDING_WINDOW_CONTRACT : SLIDING_WINDOW_CONTRACT;
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const SlidingWindow = await ethers.getContractFactory(type, deployer);

  let slidingWindow;
  if (light) {
    slidingWindow = await SlidingWindow.deploy(startBlockNumber, blockPeriod, frameSize);
  } else {
    slidingWindow = await SlidingWindow.deploy(startBlockNumber, blockPeriod, frameSize, slotSize);
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

export const deployLightWeightSlidingWindow = async function ({
  startBlockNumber = 100, // start at a current block.number
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
}) {
  return deploySlidingWindowSelector(true, startBlockNumber, blockPeriod, frameSize);
};

export const deploySlidingWindow = async function ({
  startBlockNumber = 100, // start at a current block.number
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era
}) {
  return deploySlidingWindowSelector(false, startBlockNumber, blockPeriod, frameSize, slotSize);
};

// TODO: Re-test the cases below. //////////////////////////////////
const deployERC20BaseSelector = async function (
  light: boolean,
  blockPeriod: number,
  frameSize: number,
  slotSize: number,
) {
  const type = light ? LIGHT_WEIGHT_ERC20_EXP_BASE_CONTRACT : ERC20_EXP_BASE_CONTRACT;
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC20EXP = await ethers.getContractFactory(type, deployer);
  let erc20exp;
  if (light) {
    erc20exp = await ERC20EXP.deploy(ERC20_EXP_NAME, ERC20_EXP_SYMBOL, blockPeriod, frameSize);
  } else {
    erc20exp = await ERC20EXP.deploy(ERC20_EXP_NAME, ERC20_EXP_SYMBOL, blockPeriod, frameSize, slotSize);
  }
  await erc20exp.deployed();

  return {
    erc20exp,
    deployer,
    alice,
    bob,
    jame,
  };
};

const deployERC20WhiteListSelector = async function (
  light: boolean,
  blockPeriod: number,
  frameSize: number,
  slotSize: number,
) {
  const type = light ? LIGHT_WEIGHT_ERC20_EXP_WHITELIST_CONTRACT : ERC20_EXP_WHITELIST_CONTRACT;
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ERC20EXP = await ethers.getContractFactory(type, deployer);
  let erc20exp;
  if (light) {
    erc20exp = await ERC20EXP.deploy(ERC20_EXP_NAME, ERC20_EXP_SYMBOL, blockPeriod, frameSize);
  } else {
    erc20exp = await ERC20EXP.deploy(ERC20_EXP_NAME, ERC20_EXP_SYMBOL, blockPeriod, frameSize, slotSize);
  }
  await erc20exp.deployed();

  return {
    erc20exp,
    deployer,
    alice,
    bob,
    jame,
  };
};

export const deployERC20EXPBase = async function ({
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era
}) {
  return deployERC20BaseSelector(false, blockPeriod, frameSize, slotSize);
};

export const deployLightWeightERC20EXPBase = async function ({
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
}) {
  // LightWeight has a fixed slot size of 4 by default.
  return deployERC20BaseSelector(true, blockPeriod, frameSize, 0);
};

export const deployERC20EXPWhitelist = async function (
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era
) {
  return deployERC20WhiteListSelector(false, blockPeriod, frameSize, slotSize);
};

export const deployLightWeightERC20EXPWhitelist = async function ({
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
}) {
  return deployERC20WhiteListSelector(true, blockPeriod, frameSize, 0);
};
//////////////////////////////////////////////////////////////////////

// libraries
const deployDoublyListLibrarySelector = async function (light: boolean, autoList: boolean, len: number) {
  const type = light
    ? LIGHT_WEIGHT_SORTED_CIRCULAR_DOUBLY_LINKED_LIST_LIBRARY_CONTRACT
    : SORTED_CIRCULAR_DOUBLY_LINKED_LIST_LIBRARY_CONTRACT;

  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const DoublyList = await ethers.getContractFactory(type, deployer);
  const doublyList = await DoublyList.deploy();
  await doublyList.deployed();

  // To automatically generate the list.
  // [1, 2, 3, ... , 8, 9, 10]
  if (autoList) {
    if (type === LIGHT_WEIGHT_SORTED_CIRCULAR_DOUBLY_LINKED_LIST_LIBRARY_CONTRACT) {
      for (let i = 0; i < len; i++) {
        const index = i + 1;
        await doublyList.insert(index);
      }
    } else {
      for (let i = 0; i < len; i++) {
        const index = i + 1;
        const data = padIndexToData(index);
        await doublyList.insert(index, data);
      }
    }
  }

  return {
    doublyList,
    deployer,
    alice,
    bob,
    jame,
  };
};

export const deployLightWeightDoublyListLibrary = async function ({autoList = false, len = 10} = {}) {
  return deployDoublyListLibrarySelector(true, autoList, len);
};

export const deployDoublyListLibrary = async function ({autoList = false, len = 10} = {}) {
  return deployDoublyListLibrarySelector(false, autoList, len);
};

const deploySlidingWindowSelectorLibrary = async function (
  light: boolean,
  startBlockNumber: number,
  blockPeriod: number,
  frameSize: number,
  slotSize?: number,
) {
  const type = light ? LIGHT_WEIGHT_SLIDING_WINDOW_LIBRARY_CONTRACT : SLIDING_WINDOW_LIBRARY_CONTRACT;
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const SlidingWindow = await ethers.getContractFactory(type, deployer);

  let slidingWindow;
  if (light) {
    slidingWindow = await SlidingWindow.deploy(startBlockNumber, blockPeriod, frameSize);
  } else {
    slidingWindow = await SlidingWindow.deploy(startBlockNumber, blockPeriod, frameSize, slotSize);
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

export const deployLightWeightSlidingWindowLibrary = async function ({
  startBlockNumber = 100, // start at a current block.number
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
}) {
  return deploySlidingWindowSelectorLibrary(true, startBlockNumber, blockPeriod, frameSize);
};

export const deploySlidingWindowLibrary = async function ({
  startBlockNumber = 100, // start at a current block.number
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era
}) {
  return deploySlidingWindowSelectorLibrary(false, startBlockNumber, blockPeriod, frameSize, slotSize);
};
