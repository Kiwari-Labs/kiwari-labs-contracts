import {expect} from "chai";
import {constants, SlidingWindow} from "../../../constant.test";
import {calculateSlidingWindowState, deployBLSW} from "./deployer.test";
import {hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("General", async function () {
    beforeEach(async function () {
      await hardhat_reset();
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
      const blockTime = constants.MIN_BLOCK_TIME + 1;
      const windowSize = constants.MIN_WINDOW_SIZE + 1;
      const {slidingWindow} = await deployBLSW({});
      const self = calculateSlidingWindowState({blockTime, windowSize});
      await slidingWindow.updateWindow(blockTime, windowSize, true);
      expect(await slidingWindow.blocksInEpoch()).to.equal(self._blocksPerEpoch);
      expect(await slidingWindow.blocksInWindow()).to.equal(self._blocksPerWindow);
      expect(await slidingWindow.windowSize()).to.equal(windowSize);
    });

    it("[FAILED] updateWindow with blocktime greater than maximum", async function () {
      const invalidBlockTime = constants.MAX_BLOCK_TIME + 1;
      const {slidingWindow} = await deployBLSW({});
      await expect(slidingWindow.updateWindow(invalidBlockTime, constants.WINDOW_SIZE, true)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidBlockTime,
      );
    });

    it("[FAILED] updateWindow with blocktime less than minimum", async function () {
      const invalidBlockTime = 0;
      const {slidingWindow} = await deployBLSW({});
      await expect(slidingWindow.updateWindow(invalidBlockTime, constants.WINDOW_SIZE, true)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidBlockTime,
      );
    });

    it("[FAILED] updateWindow with windowSize greater than maximum", async function () {
      const invalidWidowSize = constants.MAX_WINDOW_SIZE + 1;
      const {slidingWindow} = await deployBLSW({});
      await expect(slidingWindow.updateWindow(constants.BLOCK_TIME, invalidWidowSize, true)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidWindowSize,
      );
    });

    it("[FAILED] updateWindow with windowSize less than minium", async function () {
      const invalidWidowSize = 0;
      const {slidingWindow} = await deployBLSW({});
      await expect(slidingWindow.updateWindow(constants.BLOCK_TIME, invalidWidowSize, true)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidWindowSize,
      );
    });
  });
};
