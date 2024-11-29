import {expect} from "chai";
import {common, LightWeightSlidingWindow} from "../../constant.test";
import {calculateLightWeightSlidingWindowState, deployLightWeightSlidingWindowLibrary} from "./utils.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per epoch", async function () {
      const blockPeriod = 400;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindowLibrary({blockPeriod});
      const self = calculateLightWeightSlidingWindowState({blockPeriod});
      expect(await lightWeightSlidingWindow.getBlocksPerEpoch()).to.equal(self._blockPerEpoch);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindowLibrary({blockPeriod});
      const self = calculateLightWeightSlidingWindowState({blockPeriod});
      expect(await lightWeightSlidingWindow.getBlocksPerSlot()).to.equal(self._blockPerSlot);
    });

    it("[HAPPY] query slot per epoch", async function () {
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindowLibrary({});
      expect(await lightWeightSlidingWindow.getSlotsPerEpoch()).to.equal(common.slotPerEpoch);
    });

    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindowLibrary({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      expect(await lightWeightSlidingWindow.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[UNHAPPY] update window reverts if the block time is less than the minimum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindowLibrary({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidBlockTime = common.minBlockTimeInMilliseconds - 1;

      await expect(lightWeightSlidingWindow.updateWindow(invalidBlockTime, frameSize, false)).to.be.revertedWithCustomError(
        lightWeightSlidingWindow,
        LightWeightSlidingWindow.errors.InvalidBlockTime,
      );
    });

    it("[UNHAPPY] update window reverts if the block time is more than maximum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindowLibrary({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidBlockTime = common.maxBlockTimeInMilliseconds + 1;

      await expect(lightWeightSlidingWindow.updateWindow(invalidBlockTime, frameSize, false)).to.be.revertedWithCustomError(
        lightWeightSlidingWindow,
        LightWeightSlidingWindow.errors.InvalidBlockTime,
      );
    });

    it("[UNHAPPY] update window reverts if the frame size is less than the minimum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindowLibrary({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidFrameSize = common.minFrameSize - 1;

      await expect(lightWeightSlidingWindow.updateWindow(blockPeriod, invalidFrameSize, false)).to.be.revertedWithCustomError(
        lightWeightSlidingWindow,
        LightWeightSlidingWindow.errors.InvalidFrameSize,
      );
    });

    it("[UNHAPPY] update window reverts if the frame size is more than maximum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindowLibrary({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidFrameSize = common.maxFrameSize + 1;

      await expect(lightWeightSlidingWindow.updateWindow(blockPeriod, invalidFrameSize, false)).to.be.revertedWithCustomError(
        lightWeightSlidingWindow,
        LightWeightSlidingWindow.errors.InvalidFrameSize,
      );
    });
  });
};
