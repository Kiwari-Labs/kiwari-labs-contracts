// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {constants, SlidingWindow} from "../../../constant.test";
import {calculateSlidingWindowState, deployBLSW} from "./deployer.test";
import {hardhat_latestBlock, hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("General", async function () {
    beforeEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] getInitialBlockNumber", async function () {
      const {slidingWindow} = await deployBLSW({});
      const blockNumber = await hardhat_latestBlock();
      expect(await slidingWindow.getInitialBlockNumber()).to.equal(blockNumber);
    });

    it("[SUCCESS] blocksInEpoch", async function () {
      const {slidingWindow} = await deployBLSW({});
      const self = calculateSlidingWindowState({});
      expect(await slidingWindow.blocksInEpoch()).to.equal(self._blocksPerEpoch);
    });

    it("[SUCCESS] blocksInWindow", async function () {
      const {slidingWindow} = await deployBLSW({});
      const self = calculateSlidingWindowState({});
      expect(await slidingWindow.blocksInWindow()).to.equal(self._blocksPerWindow);
    });

    it("[SUCCESS] windowSize", async function () {
      const {slidingWindow} = await deployBLSW({});
      const self = calculateSlidingWindowState({});
      expect(await slidingWindow.windowSize()).to.equal(self._windowSize);
    });

    it("[SUCCESS] updateWindow", async function () {
      const blocksPerEpoch = constants.MIN_BLOCKS_PER_EPOCH + 1;
      const windowSize = constants.MIN_WINDOW_SIZE + 1;
      const {slidingWindow} = await deployBLSW({});
      const self = calculateSlidingWindowState({blocksPerEpoch, windowSize});
      await slidingWindow.updateWindow(self._blocksPerEpoch, self._windowSize, true);
      expect(await slidingWindow.blocksInEpoch()).to.equal(self._blocksPerEpoch);
      expect(await slidingWindow.blocksInWindow()).to.equal(self._blocksPerWindow);
      expect(await slidingWindow.windowSize()).to.equal(windowSize);
    });

    it("[FAILED] updateWindow with duration greater than maximum", async function () {
      const invalidBlocksPerEpoch = constants.MAX_BLOCKS_PER_EPOCH + 1;
      const {slidingWindow} = await deployBLSW({});
      await expect(slidingWindow.updateWindow(invalidBlocksPerEpoch, constants.DEFAULT_WINDOW_SIZE, true)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidDuration,
      );
    });

    it("[FAILED] updateWindow with duration less than minimum", async function () {
      const invalidBlocksPerEpoch = 0;
      const {slidingWindow} = await deployBLSW({});
      await expect(slidingWindow.updateWindow(invalidBlocksPerEpoch, constants.DEFAULT_WINDOW_SIZE, true)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidDuration,
      );
    });

    it("[FAILED] updateWindow with windowSize greater than maximum", async function () {
      const invalidWidowSize = constants.MAX_WINDOW_SIZE + 1;
      const {slidingWindow} = await deployBLSW({});
      await expect(slidingWindow.updateWindow(constants.DEFAULT_BLOCKS_PER_EPOCH, invalidWidowSize, true)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidSize,
      );
    });

    it("[FAILED] updateWindow with windowSize less than minium", async function () {
      const invalidWidowSize = 0;
      const {slidingWindow} = await deployBLSW({});
      await expect(slidingWindow.updateWindow(constants.DEFAULT_BLOCKS_PER_EPOCH, invalidWidowSize, true)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidSize,
      );
    });
  });
};
