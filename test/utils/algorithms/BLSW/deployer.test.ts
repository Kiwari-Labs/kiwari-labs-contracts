import {ethers} from "hardhat";
import {BLSWLibrary, constants} from "../../../constant.test";
import {MockBLSW} from "../../../../typechain-types/mocks/contracts/utils";

export interface Window {
  _blocksPerEpoch: number;
  _blocksPerWindow: number;
  _windowSize: number;
  _initialBlockNumber: number;
}

export const calculateSlidingWindowState = function ({
  startBlockNumber = 1,
  blockTime = constants.BLOCK_TIME,
  windowSize = constants.WINDOW_SIZE,
}): Window {
  const self: Window = {
    _blocksPerEpoch: 0,
    _blocksPerWindow: 0,
    _windowSize: 0,
    _initialBlockNumber: 0,
  };
  self._initialBlockNumber = startBlockNumber;
  // Why 'Math.floor', Since Solidity always rounds down.
  const blocksPerEpoch = Math.floor(Math.floor(constants.YEAR_IN_MILLISECONDS / blockTime) / 4);
  self._blocksPerEpoch = blocksPerEpoch;
  self._blocksPerWindow = blocksPerEpoch * windowSize;
  self._windowSize = windowSize;
  return self;
};

export const deployBLSW = async function ({
  startBlockNumber = 1,
  blockTime = constants.BLOCK_TIME,
  windowSize = constants.WINDOW_SIZE,
  development = false,
}) {
  const self = calculateSlidingWindowState({
    startBlockNumber,
    blockTime,
    windowSize,
  });
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const BLSW = await ethers.getContractFactory(BLSWLibrary.name, deployer);
  const slidingWindow = (await BLSW.deploy(
    self._initialBlockNumber,
    self._blocksPerEpoch,
    self._windowSize,
    development,
  )) as any as MockBLSW;
  await slidingWindow.waitForDeployment();

  return {
    slidingWindow,
    deployer,
    alice,
    bob,
    charlie,
  };
};
