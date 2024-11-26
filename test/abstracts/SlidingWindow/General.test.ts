import {expect} from "chai";
import {deploySlidingWindow} from "./utils.test";
import {common, SlidingWindow} from "../../constant.test";
import {mineBlock} from "../../utils.test";
import {calculateSlidingWindowState} from "../../utils/SlidingWindow/utils.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per epoch", async function () {
      const blockPeriod = 400;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod});
      const self = calculateSlidingWindowState({blockPeriod});
      expect(await slidingWindow.getBlockPerEpoch()).to.equal(self._blockPerEpoch);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize});
      expect(await slidingWindow.getBlockPerSlot()).to.equal(self._blockPerSlot);
    });

    it("[HAPPY] query slot per epoch", async function () {
      const slotSize = 4;
      const {slidingWindow} = await deploySlidingWindow({slotSize});
      const self = calculateSlidingWindowState({slotSize});
      expect(await slidingWindow.getSlotPerEpoch()).to.equal(self._slotSize);
    });

    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[UNHAPPY] update window reverts if the block time is less than the minimum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidBlockTime = common.minBlockTimeInMilliseconds - 1;

      await expect(slidingWindow.updateWindow(invalidBlockTime, frameSize, slotSize)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidBlockTime,
      );
    });

    it("[UNHAPPY] update window reverts if the block time is more than maximum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidBlockTime = common.maxBlockTimeInMilliseconds + 1;

      await expect(slidingWindow.updateWindow(invalidBlockTime, frameSize, slotSize)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidBlockTime,
      );
    });

    it("[UNHAPPY] update window reverts if the frame size is less than the minimum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidFrameSize = common.minFrameSize - 1;

      await expect(slidingWindow.updateWindow(blockPeriod, invalidFrameSize, slotSize)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidFrameSize,
      );
    });

    it("[UNHAPPY] update window reverts if the frame size is more than maximum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidFrameSize = common.maxFrameSize + 1;

      await expect(slidingWindow.updateWindow(blockPeriod, invalidFrameSize, slotSize)).to.be.revertedWithCustomError(
        slidingWindow,
        SlidingWindow.errors.InvalidFrameSize,
      );
    });

    it("[UNHAPPY] update window reverts if the slot size is less than the minimum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidSlotPerEpoch = common.minSlotPerEpoch - 1;

      await expect(
        slidingWindow.updateWindow(blockPeriod, frameSize, invalidSlotPerEpoch),
      ).to.be.revertedWithCustomError(slidingWindow, SlidingWindow.errors.InvalidSlotPerEpoch);
    });

    it("[UNHAPPY] update window reverts if the slot size is more than maximum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidSlotPerEpoch = common.maxSlotPerEpoch + 1;

      await expect(
        slidingWindow.updateWindow(blockPeriod, frameSize, invalidSlotPerEpoch),
      ).to.be.revertedWithCustomError(slidingWindow, SlidingWindow.errors.InvalidSlotPerEpoch);
    });

    it("[HAPPY] query frame", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize, startBlockNumber});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});

      await mineBlock(Number(self._blockPerSlot) * 5);

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["frame()"]();

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(3);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] query safe frame", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize, startBlockNumber});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});

      await mineBlock(Number(self._blockPerSlot) * 5);

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame()"]();

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] query calculate epoch and slot", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize, startBlockNumber});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});

      await mineBlock(Number(self._blockPerSlot) * 5);

      let [epoch, slot] = await slidingWindow.currentEpochAndSlot();

      expect(epoch).to.equal(1);
      expect(slot).to.equal(1);
    });
  });
};
