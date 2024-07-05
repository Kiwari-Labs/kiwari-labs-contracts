import {expect} from "chai";
import {deployLightWeightSlidingWindow, calculateLightWeightSlidingWindowState} from "../utils.test";
import {
  INVALID_BLOCK_TIME,
  INVALID_FRAME_SIZ,
  MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS,
  MAXIMUM_FRAME_SIZE,
  MINIMUM_BLOCKTIME_IN_MILLI_SECONDS,
  MINIMUM_FRAME_SIZE,
  SLOT_PER_ERA,
} from "../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per era", async function () {
      const blockPeriod = 400;
      const {slidingWindow} = await deployLightWeightSlidingWindow({blockPeriod});
      const self = calculateLightWeightSlidingWindowState({blockPeriod});
      expect(await slidingWindow.getBlockPerEra()).to.equal(self._blockPerEra);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const {slidingWindow} = await deployLightWeightSlidingWindow({blockPeriod});
      const self = calculateLightWeightSlidingWindowState({blockPeriod});
      expect(await slidingWindow.getBlockPerSlot()).to.equal(self._blockPerSlot);
    });

    it("[HAPPY] query slot per era", async function () {
      const {slidingWindow} = await deployLightWeightSlidingWindow({});
      expect(await slidingWindow.getSlotPerEra()).to.equal(SLOT_PER_ERA);
    });

    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {slidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      expect(await slidingWindow.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[HAPPY] query frame size in era length", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {slidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      expect(await slidingWindow.getFrameSizeInEraLength()).to.equal(self._frameSizeInEraAndSlotLength[0]);
    });

    it("[HAPPY] query frame size in era length when token expire in first era", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {slidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      expect(await slidingWindow.getFrameSizeInEraLength()).to.equal(self._frameSizeInEraAndSlotLength[0]);
    });

    it("[HAPPY] query frame size in slot length", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {slidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      expect(await slidingWindow.getFrameSizeInSlotLength()).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[HAPPY] query frame size in slot length when token expire in first era", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {slidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      expect(await slidingWindow.getFrameSizeInSlotLength()).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[HAPPY] query frame size in era and slot length", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {slidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      const getFrameSizeInEraAndSlotLength = await slidingWindow.getFrameSizeInEraAndSlotLength();
      expect(getFrameSizeInEraAndSlotLength.length).to.equal(self._frameSizeInEraAndSlotLength.length);
      expect(getFrameSizeInEraAndSlotLength[0]).to.equal(self._frameSizeInEraAndSlotLength[0]);
      expect(getFrameSizeInEraAndSlotLength[1]).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[HAPPY] query frame size in era and slot length when token expire in first era", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {slidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      const getFrameSizeInEraAndSlotLength = await slidingWindow.getFrameSizeInEraAndSlotLength();
      expect(getFrameSizeInEraAndSlotLength.length).to.equal(self._frameSizeInEraAndSlotLength.length);
      expect(getFrameSizeInEraAndSlotLength[0]).to.equal(self._frameSizeInEraAndSlotLength[0]);
      expect(getFrameSizeInEraAndSlotLength[1]).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[UNHAPPY] update window reverts if the block ttime is less than the minimum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deployLightWeightSlidingWindow({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidBlockTime = MINIMUM_BLOCKTIME_IN_MILLI_SECONDS - 1;

      await expect(slidingWindow.updateWindow(invalidBlockTime, frameSize)).to.be.revertedWithCustomError(
        slidingWindow,
        INVALID_BLOCK_TIME,
      );
    });

    it("[UNHAPPY] update window reverts if the block time is more than maximum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deployLightWeightSlidingWindow({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidBlockTime = MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS + 1;

      await expect(slidingWindow.updateWindow(invalidBlockTime, frameSize)).to.be.revertedWithCustomError(
        slidingWindow,
        INVALID_BLOCK_TIME,
      );
    });

    it("[UNHAPPY] update window reverts if the frame size is less than the minimum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deployLightWeightSlidingWindow({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidFrameSize = MINIMUM_FRAME_SIZE - 1;

      await expect(slidingWindow.updateWindow(blockPeriod, invalidFrameSize)).to.be.revertedWithCustomError(
        slidingWindow,
        INVALID_FRAME_SIZ,
      );
    });

    it("[UNHAPPY] update window reverts if the frame size is more than maximum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deployLightWeightSlidingWindow({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidFrameSize = MAXIMUM_FRAME_SIZE + 1;

      await expect(slidingWindow.updateWindow(blockPeriod, invalidFrameSize)).to.be.revertedWithCustomError(
        slidingWindow,
        INVALID_FRAME_SIZ,
      );
    });
  });
};
