import {expect} from "chai";
import {deployLightWeightSlidingWindow} from "./utils.test";
import {common, LightWeightSlidingWindow} from "../../constant.test";
import {mineBlock} from "../../utils.test";
import {calculateLightWeightSlidingWindowState} from "../../utils/LightWeightSlidingWindow/utils.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per era", async function () {
      const blockPeriod = 400;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({blockPeriod});
      const self = calculateLightWeightSlidingWindowState({blockPeriod});
      expect(await lightWeightSlidingWindow.getBlockPerEra()).to.equal(self._blockPerEra);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({blockPeriod});
      const self = calculateLightWeightSlidingWindowState({blockPeriod});
      expect(await lightWeightSlidingWindow.getBlockPerSlot()).to.equal(self._blockPerSlot);
    });

    it("[HAPPY] query slot per era", async function () {
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({});
      expect(await lightWeightSlidingWindow.getSlotPerEra()).to.equal(common.slotPerEra);
    });

    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      expect(await lightWeightSlidingWindow.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[HAPPY] query frame size in era length", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      expect(await lightWeightSlidingWindow.getFrameSizeInEraLength()).to.equal(self._frameSizeInEraAndSlotLength[0]);
    });

    it("[HAPPY] query frame size in slot length", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      expect(await lightWeightSlidingWindow.getFrameSizeInSlotLength()).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[HAPPY] query frame size in era and slot length", async function () {
      const blockPeriod = 400;
      const frameSize = 2;
      const {lightWeightSlidingWindow} = await deployLightWeightSlidingWindow({blockPeriod, frameSize});
      const self = calculateLightWeightSlidingWindowState({blockPeriod, frameSize});
      const getFrameSizeInEraAndSlotLength = await lightWeightSlidingWindow.getFrameSizeInEraAndSlotLength();
      expect(getFrameSizeInEraAndSlotLength.length).to.equal(self._frameSizeInEraAndSlotLength.length);
      expect(getFrameSizeInEraAndSlotLength[0]).to.equal(self._frameSizeInEraAndSlotLength[0]);
      expect(getFrameSizeInEraAndSlotLength[1]).to.equal(self._frameSizeInEraAndSlotLength[1]);
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

      await expect(lightWeightSlidingWindow.updateWindow(invalidBlockTime, frameSize)).to.be.revertedWithCustomError(
        lightWeightSlidingWindow,
        LightWeightSlidingWindow.errors.InvalidBlockTime,
      );
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

      await expect(lightWeightSlidingWindow.updateWindow(invalidBlockTime, frameSize)).to.be.revertedWithCustomError(
        lightWeightSlidingWindow,
        LightWeightSlidingWindow.errors.InvalidBlockTime,
      );
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

      await expect(lightWeightSlidingWindow.updateWindow(blockPeriod, invalidFrameSize)).to.be.revertedWithCustomError(
        lightWeightSlidingWindow,
        LightWeightSlidingWindow.errors.InvalidFrameSize,
      );
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

      await expect(lightWeightSlidingWindow.updateWindow(blockPeriod, invalidFrameSize)).to.be.revertedWithCustomError(
        lightWeightSlidingWindow,
        LightWeightSlidingWindow.errors.InvalidFrameSize,
      );
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

      const [fromEra, toEra, fromSlot, toSlot] = await lightWeightSlidingWindow["frame()"]();

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

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

      const [fromEra, toEra, fromSlot, toSlot] = await lightWeightSlidingWindow["safeFrame()"]();

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] query calculate era and slot", async function () {
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

      let [era, slot] = await lightWeightSlidingWindow.currentEraAndSlot();

      expect(era).to.equal(1);
      expect(slot).to.equal(1);
    });
  });
};
