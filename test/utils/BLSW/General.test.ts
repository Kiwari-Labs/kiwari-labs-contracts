import {expect} from "chai";
import {common, SlidingWindow} from "../../constant.test";
import {calculateSlidingWindowState, deployBLSW} from "./utils.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per epoch", async function () {
      const {slidingWindow} = await deployBLSW({});
      const self = calculateSlidingWindowState({});
      expect(await slidingWindow.blocksInEpoch()).to.equal(self._blocksPerEpoch);
    });

    it("[HAPPY] query window size in block length", async function () {
      // const slotSize = 4;
      // const frameSize = 2;
      // const {slidingWindow} = await deployBLSW({blockPeriod, slotSize, frameSize});
      // const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      // expect(await slidingWindow.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[UNHAPPY] update window reverts if the block time is less than the minimum", async function () {
      // const slotSize = 4;
      // const frameSize = 2;
      // const startBlockNumber = 0;
      // const {slidingWindow} = await deployBLSW({startBlockNumber, blockPeriod, frameSize, slotSize});
      // const invalidBlockTime = common.minBlockTimeInMilliseconds - 1;
      // await expect(slidingWindow.updateWindow(invalidBlockTime, frameSize, slotSize, false)).to.be.revertedWithCustomError(
      //   slidingWindow,
      //   SlidingWindow.errors.InvalidBlockTime,
      // );
    });

    it("[UNHAPPY] update window reverts if the block time is more than maximum", async function () {
      // const slotSize = 4;
      // const frameSize = 2;
      // const startBlockNumber = 0;
      // const {slidingWindow} = await deployBLSW({startBlockNumber, blockPeriod, frameSize, slotSize});
      // const invalidBlockTime = common.maxBlockTimeInMilliseconds + 1;
      // await expect(slidingWindow.updateWindow(invalidBlockTime, frameSize, slotSize, false)).to.be.revertedWithCustomError(
      //   slidingWindow,
      //   SlidingWindow.errors.InvalidBlockTime,
      // );
    });

    it("[UNHAPPY] update window reverts if the window size is less than the minimum", async function () {
      // const slotSize = 4;
      // const frameSize = 2;
      // const startBlockNumber = 0;
      // const {slidingWindow} = await deployBLSW({startBlockNumber, blockPeriod, frameSize, slotSize});
      // const invalidFrameSize = common.minFrameSize - 1;
      // await expect(slidingWindow.updateWindow(blockPeriod, invalidFrameSize, slotSize, false)).to.be.revertedWithCustomError(
      //   slidingWindow,
      //   SlidingWindow.errors.InvalidFrameSize,
      // );
    });

    it("[UNHAPPY] update window reverts if the window size is more than maximum", async function () {
      // const slotSize = 4;
      // const frameSize = 2;
      // const startBlockNumber = 0;
      // const {slidingWindow} = await deployBLSW({startBlockNumber, blockPeriod, frameSize, slotSize});
      // const invalidFrameSize = common.maxFrameSize + 1;
      // await expect(slidingWindow.updateWindow(blockPeriod, invalidFrameSize, slotSize, false)).to.be.revertedWithCustomError(
      //   slidingWindow,
      //   SlidingWindow.errors.InvalidFrameSize,
      // );
    });
  });
};
