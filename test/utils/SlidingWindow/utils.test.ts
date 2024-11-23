import {ethers} from "hardhat";
import {SlidingWindowLibrary} from "../../constant.test";
import {common} from "../../constant.test";

export interface ISlidingWindowState {
  _blockPerEpoch: Number;
  _blockPerSlot: Number;
  _frameSizeInBlockLength: Number;
  _frameSizeInEpochAndSlotLength: Array<Number>;
  _startBlockNumber: Number;
  _slotSize: Number;
}

export const calculateSlidingWindowState = function ({
  startBlockNumber = 100,
  blockPeriod = 400,
  frameSize = 2,
  slotSize = 4,
}): ISlidingWindowState {
  const self: ISlidingWindowState = {
    _blockPerEpoch: 0,
    _blockPerSlot: 0,
    _frameSizeInBlockLength: 0,
    _frameSizeInEpochAndSlotLength: [],
    _slotSize: 0,
    _startBlockNumber: 0,
  };

  self._startBlockNumber = startBlockNumber;

  // Why 'Math.floor', Since Solidity always rounds down.
  const blockPerSlotCache = Math.floor(Math.floor(common.yearInMilliseconds / blockPeriod) / slotSize);
  const blockPerEpochCache = blockPerSlotCache * slotSize;

  self._blockPerEpoch = blockPerEpochCache;
  self._blockPerSlot = blockPerSlotCache;
  self._frameSizeInBlockLength = blockPerSlotCache * frameSize;
  self._slotSize = slotSize;
  if (frameSize <= slotSize) {
    self._frameSizeInEpochAndSlotLength[0] = 0;
    self._frameSizeInEpochAndSlotLength[1] = frameSize;
  } else {
    self._frameSizeInEpochAndSlotLength[0] = frameSize / slotSize;
    self._frameSizeInEpochAndSlotLength[1] = frameSize % slotSize;
  }

  return self;
};

export const deploySlidingWindowLibrary = async function ({
  startBlockNumber = 100, // start at a current block.number
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per epoch
}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const SlidingWindow = await ethers.getContractFactory(SlidingWindowLibrary.name, deployer);

  const slidingWindow = await SlidingWindow.deploy(startBlockNumber, blockPeriod, frameSize, slotSize);

  await slidingWindow.deployed();

  return {
    slidingWindow,
    deployer,
    alice,
    bob,
    jame,
  };
};
