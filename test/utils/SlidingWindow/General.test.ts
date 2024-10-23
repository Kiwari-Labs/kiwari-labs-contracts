import {expect} from "chai";
import {deploySlidingWindowLibrary, calculateSlidingWindowState} from "../../utils.test";
import {
  ERROR_INVALID_BLOCK_TIME,
  ERROR_INVALID_FRAME_SIZE,
  ERROR_INVALID_SLOT_PER_ERA,
  MAXIMUM_BLOCK_TIME_IN_MILLISECONDS,
  MAXIMUM_FRAME_SIZE,
  MAXIMUM_SLOT_PER_ERA,
  MINIMUM_BLOCK_TIME_IN_MILLISECONDS,
  MINIMUM_FRAME_SIZE,
  MINIMUM_SLOT_PER_ERA,
} from "../../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per era", async function () {
      const blockPeriod = 400;
      const {slidingWindow} = await deploySlidingWindowLibrary({blockPeriod});
      const self = calculateSlidingWindowState({blockPeriod});
      expect(await slidingWindow.getBlockPerEra()).to.equal(self._blockPerEra);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const {slidingWindow} = await deploySlidingWindowLibrary({blockPeriod, slotSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize});
      expect(await slidingWindow.getBlockPerSlot()).to.equal(self._blockPerSlot);
    });

    it("[HAPPY] query slot per era", async function () {
      const slotSize = 4;
      const {slidingWindow} = await deploySlidingWindowLibrary({slotSize});
      const self = calculateSlidingWindowState({slotSize});
      expect(await slidingWindow.getSlotPerEra()).to.equal(self._slotSize);
    });

    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindowLibrary({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[HAPPY] query frame size in era length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindowLibrary({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInEraLength()).to.equal(self._frameSizeInEraAndSlotLength[0]);
    });

    it("[HAPPY] query frame size in slot length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindowLibrary({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInSlotLength()).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[HAPPY] query frame size in era and slot length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindowLibrary({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      const getFrameSizeInEraAndSlotLength = await slidingWindow.getFrameSizeInEraAndSlotLength();
      expect(getFrameSizeInEraAndSlotLength.length).to.equal(self._frameSizeInEraAndSlotLength.length);
      expect(getFrameSizeInEraAndSlotLength[0]).to.equal(self._frameSizeInEraAndSlotLength[0]);
      expect(getFrameSizeInEraAndSlotLength[1]).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[UNHAPPY] update window reverts if the block time is less than the minimum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindowLibrary({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidBlockTime = MINIMUM_BLOCK_TIME_IN_MILLISECONDS - 1;

      await expect(slidingWindow.updateWindow(invalidBlockTime, frameSize, slotSize)).to.be.revertedWithCustomError(
        slidingWindow,
        ERROR_INVALID_BLOCK_TIME,
      );
    });

    it("[UNHAPPY] update window reverts if the block time is more than maximum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindowLibrary({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidBlockTime = MAXIMUM_BLOCK_TIME_IN_MILLISECONDS + 1;

      await expect(slidingWindow.updateWindow(invalidBlockTime, frameSize, slotSize)).to.be.revertedWithCustomError(
        slidingWindow,
        ERROR_INVALID_BLOCK_TIME,
      );
    });

    it("[UNHAPPY] update window reverts if the frame size is less than the minimum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindowLibrary({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidFrameSize = MINIMUM_FRAME_SIZE - 1;

      await expect(slidingWindow.updateWindow(blockPeriod, invalidFrameSize, slotSize)).to.be.revertedWithCustomError(
        slidingWindow,
        ERROR_INVALID_FRAME_SIZE,
      );
    });

    it("[UNHAPPY] update window reverts if the frame size is more than maximum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindowLibrary({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidFrameSize = MAXIMUM_FRAME_SIZE + 1;

      await expect(slidingWindow.updateWindow(blockPeriod, invalidFrameSize, slotSize)).to.be.revertedWithCustomError(
        slidingWindow,
        ERROR_INVALID_FRAME_SIZE,
      );
    });

    it("[UNHAPPY] update window reverts if the slot size is less than the minimum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindowLibrary({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidSlotPerEra = MINIMUM_SLOT_PER_ERA - 1;

      await expect(slidingWindow.updateWindow(blockPeriod, frameSize, invalidSlotPerEra)).to.be.revertedWithCustomError(
        slidingWindow,
        ERROR_INVALID_SLOT_PER_ERA,
      );
    });

    it("[UNHAPPY] update window reverts if the slot size is more than maximum", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 0;

      const {slidingWindow} = await deploySlidingWindowLibrary({startBlockNumber, blockPeriod, frameSize, slotSize});

      const invalidSlotPerEra = MAXIMUM_SLOT_PER_ERA + 1;

      await expect(slidingWindow.updateWindow(blockPeriod, frameSize, invalidSlotPerEra)).to.be.revertedWithCustomError(
        slidingWindow,
        ERROR_INVALID_SLOT_PER_ERA,
      );
    });
  });
};
