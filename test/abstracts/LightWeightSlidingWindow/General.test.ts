import {expect} from "chai";
import {deployLightWeightSlidingWindow} from "./utils.test";
import {common, LightWeightSlidingWindow} from "../../constant.test";
import {mineBlock} from "../../utils.test";
import {calculateLightWeightSlidingWindowState} from "../../utils/LightWeightSlidingWindow/utils.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per epoch", async function () {
      const blockPeriod = 400;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({blockPeriod});
      const self = calculateLightWeightSlidingWindowState({blockPeriod});
      expect(await lightWeightSlidingWindow.getBlocksPerEpoch()).to.equal(self._blockPerEpoch);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({blockPeriod});
      const self = calculateLightWeightSlidingWindowState({blockPeriod});
      expect(await lightWeightSlidingWindow.getBlocksPerSlot()).to.equal(self._blockPerSlot);
    });

    it("[HAPPY] query slot per epoch", async function () {
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({});
      expect(await lightWeightSlidingWindow.getSlotsPerEpoch()).to.equal(common.slotPerEpoch);
    });

    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      expect(await lightWeightSlidingWindow.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[UNHAPPY] update window reverts if the block time is less than the minimum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidBlockTime = common.minBlockTimeInMilliseconds - 1;

      await expect(
        lightWeightSlidingWindow.updateWindow(invalidBlockTime, frameSize, false),
      ).to.be.revertedWithCustomError(lightWeightSlidingWindow, LightWeightSlidingWindow.errors.InvalidBlockTime);
    });

    it("[UNHAPPY] update window reverts if the block time is more than maximum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidBlockTime = common.maxBlockTimeInMilliseconds + 1;

      await expect(
        lightWeightSlidingWindow.updateWindow(invalidBlockTime, frameSize, false),
      ).to.be.revertedWithCustomError(lightWeightSlidingWindow, LightWeightSlidingWindow.errors.InvalidBlockTime);
    });

    it("[UNHAPPY] update window reverts if the frame size is less than the minimum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidFrameSize = common.minFrameSize - 1;

      await expect(
        lightWeightSlidingWindow.updateWindow(blockPeriod, invalidFrameSize, false),
      ).to.be.revertedWithCustomError(lightWeightSlidingWindow, LightWeightSlidingWindow.errors.InvalidFrameSize);
    });

    it("[UNHAPPY] update window reverts if the frame size is more than maximum", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({
        startBlockNumber,
        blockPeriod,
        frameSize,
      });

      const invalidFrameSize = common.maxFrameSize + 1;

      await expect(
        lightWeightSlidingWindow.updateWindow(blockPeriod, invalidFrameSize, false),
      ).to.be.revertedWithCustomError(lightWeightSlidingWindow, LightWeightSlidingWindow.errors.InvalidFrameSize);
    });

    it("[HAPPY] query frame", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({
        blockPeriod,
        frameSize,
        startBlockNumber,
      });

      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});

      await mineBlock(Number(self._blockPerSlot) * 5);

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await lightWeightSlidingWindow["frame()"]();

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(3);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] query safe frame", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({
        blockPeriod,
        frameSize,
        startBlockNumber,
      });

      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});

      await mineBlock(Number(self._blockPerSlot) * 5);

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await lightWeightSlidingWindow["safeFrame()"]();

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] query calculate epoch and slot", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({
        blockPeriod,
        frameSize,
        startBlockNumber,
      });

      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});

      await mineBlock(Number(self._blockPerSlot) * 5);

      let [epoch, slot] = await lightWeightSlidingWindow.currentEpochAndSlot();

      expect(epoch).to.equal(1);
      expect(slot).to.equal(1);
    });
  });
};
