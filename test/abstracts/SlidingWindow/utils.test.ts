import {ethers} from "hardhat";
import {common, SlidingWindow} from "../../constant.test";

export interface ISlidingWindowState {
  _blockPerEra: Number;
  _blockPerSlot: Number;
  _frameSizeInBlockLength: Number;
  _frameSizeInEraAndSlotLength: Array<Number>;
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
    _blockPerEra: 0,
    _blockPerSlot: 0,
    _frameSizeInBlockLength: 0,
    _frameSizeInEraAndSlotLength: [],
    _slotSize: 0,
    _startBlockNumber: 0,
  };

  self._startBlockNumber = startBlockNumber;

  // Why 'Math.floor', Since Solidity always rounds down.
  const blockPerSlotCache = Math.floor(Math.floor(common.yearInMilliseconds / blockPeriod) / slotSize);
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

export const deploySlidingWindow = async function ({
  startBlockNumber = 100, // start at a current block.number
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per era
}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const SlidingWindowContract = await ethers.getContractFactory(SlidingWindow.name, deployer);

  const slidingWindow = await SlidingWindowContract.deploy(startBlockNumber, blockPeriod, frameSize, slotSize);

  await slidingWindow.deployed();

  return {
    slidingWindow,
    deployer,
    alice,
    bob,
    jame,
  };
};
