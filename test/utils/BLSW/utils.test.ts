import {ethers} from "hardhat";
import {BLSWLibrary} from "../../constant.test";
import {common} from "../../constant.test";

export interface ISlidingWindowState {
  _blocksPerEpoch: Number;
  _windowSize: Number;
  _initialBlockNumber: Number;
}

export const calculateSlidingWindowState = function ({
  startBlockNumber = 100,
  blockTime = 400,
  windowSize = 2,
}): ISlidingWindowState {
  const self: ISlidingWindowState = {
    _blocksPerEpoch: 0,
    _windowSize: 0,
    _initialBlockNumber: 0,
  };
  self._initialBlockNumber = startBlockNumber;
  // Why 'Math.floor', Since Solidity always rounds down.
  const blocksPerEpochCache = Math.floor(Math.floor(common.yearInMilliseconds / blockTime) / 4);
  self._blocksPerEpoch = blocksPerEpochCache;
  self._windowSize = windowSize;
  return self;
};

export const deployBLSW = async function ({
  startBlockNumber = 100, // start at `block.number` 100
  blockTime = 400, // block-time 400 milliseconds
  windowSize = 2, // window size 2 epochs
}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();
  const BLSW = await ethers.getContractFactory(BLSWLibrary.name, deployer);
  const slidingWindow = await BLSW.deploy(startBlockNumber, blockTime, windowSize);
  await slidingWindow.deployed();
  return {
    slidingWindow,
    deployer,
    alice,
    bob,
    jame,
  };
};
