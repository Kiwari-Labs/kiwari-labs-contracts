import {ethers} from "hardhat";
import {common} from "../../constant.test";
import {LightWeightSlidingWindowLibrary} from "../../constant.test";

export interface ILightWeightSlidingWindowState {
  _blockPerEra: Number;
  _blockPerSlot: Number;
  _frameSizeInBlockLength: Number;
  _frameSizeInEraAndSlotLength: Array<Number>;
  _startBlockNumber: Number;
}

export const calculateLightWeightSlidingWindowState = function ({
  startBlockNumber = 100,
  blockPeriod = 400,
  frameSize = 2,
}): ILightWeightSlidingWindowState {
  const self: ILightWeightSlidingWindowState = {
    _blockPerEra: 0,
    _blockPerSlot: 0,
    _frameSizeInBlockLength: 0,
    _frameSizeInEraAndSlotLength: [],
    _startBlockNumber: 0,
  };

  self._startBlockNumber = startBlockNumber;

  // Why 'Math.floor', Since Solidity always rounds down.
  const blockPerSlotCache = Math.floor(common.yearInMilliseconds / blockPeriod) >> common.twoBits;
  // Assume block per year equal to 78892315.
  // Convert 78892315 into its binary: 100101110011010011011111011
  // Shift the bits to the right by 2 positions: 100101110011010011011111011 >> 2
  // After shifting: 001001011100110100110111110
  // Convert this binary number back to decimal: 19723078
  // This is because shifting 78892315 to the right by 2 bits
  // results in 19723078, which is the floor value of 78892315 / 4.
  const blockPerEraCache = blockPerSlotCache << common.twoBits;

  self._blockPerEra = blockPerEraCache;
  self._blockPerSlot = blockPerSlotCache;
  self._frameSizeInBlockLength = blockPerSlotCache * frameSize;
  if (frameSize <= common.slotPerEra) {
    self._frameSizeInEraAndSlotLength[0] = 0;
    self._frameSizeInEraAndSlotLength[1] = frameSize;
  } else {
    // Assume frame size equal to 2.
    // The number 2 in binary is [10].
    // Shifting [10] to the right by 2 positions results is [00].
    // Convert this binary number back to decimal: 0
    self._frameSizeInEraAndSlotLength[0] = frameSize >> common.twoBits;
    // The number 2 in binary is 10.
    // The number 3 in binary is 11.
    // The binary result of 2 & 3 is 10, which is 2 in decimal.
    self._frameSizeInEraAndSlotLength[1] = frameSize & common.threeBits;
  }

  return self;
};

export const deployLightWeightSlidingWindowLibrary = async function ({
  startBlockNumber = 100, // start at a current block.number
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const LightWeightSlidingWindowLibraryContract = await ethers.getContractFactory(
    LightWeightSlidingWindowLibrary.name,
    deployer,
  );

  const lightWeightSlidingWindow = await LightWeightSlidingWindowLibraryContract.deploy(
    startBlockNumber,
    blockPeriod,
    frameSize,
  );

  await lightWeightSlidingWindow.deployed();

  return {
    lightWeightSlidingWindow,
    deployer,
    alice,
    bob,
    jame,
  };
};
