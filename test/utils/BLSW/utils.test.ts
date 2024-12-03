import {ethers} from "hardhat";
import {BLSWLibrary, SlidingWindowLibrary} from "../../constant.test";
import {common} from "../../constant.test";

export interface ISlidingWindowState {
  _blocksPerEpoch: Number;
  _windowSize: Number;
  _initialBlockNumber: Number;
}

export const calculateSlidingWindowState = function ({
  startBlockNumber = 100,
  blockPeriod = 400,
  windowSize = 2,
}): ISlidingWindowState {
  const self: ISlidingWindowState = {
    _blocksPerEpoch: 0,
    _windowSize: 0,
    _initialBlockNumber: 0,
  };

  self._initialBlockNumber = startBlockNumber;

  // Why 'Math.floor', Since Solidity always rounds down.
  const blockPersEpochCache = Math.floor(Math.floor(common.yearInMilliseconds / blockPeriod) / windowSize);

  self._blocksPerEpoch = blockPersEpochCache;
  self._windowSize = windowSize;
  return self;
};

export const deployBLSW = async function ({
  startBlockNumber = 100, // start at a current block.number
  blockPeriod = 400, // 400ms per block
  windowSize = 2, // frame size 2 slot
}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const BLSW = await ethers.getContractFactory(BLSWLibrary.name, deployer);

  const slidingWindow = await BLSW.deploy(startBlockNumber, blockPeriod, windowSize);

  await slidingWindow.deployed();

  return {
    slidingWindow,
    deployer,
    alice,
    bob,
    jame,
  };
};
