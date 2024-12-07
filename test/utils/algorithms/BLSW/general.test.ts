import {expect} from "chai";
import {SlidingWindow} from "../../../constant.test";
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
      // const slotSize = 4;
      // const frameSize = 2;
      // const {slidingWindow} = await deployBLSW({blockPeriod, slotSize, frameSize});
      // const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      // expect(await slidingWindow.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[FAILED] windowSize", async function () {
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

    it("[FAILED] update window reverts if the block time is more than maximum", async function () {
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

    it("[FAILED] update window reverts if the window size is less than the minimum", async function () {
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

    it("[FAILED] update window reverts if the window size is more than maximum", async function () {
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
