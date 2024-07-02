import {expect} from "chai";
import {deploySlidingWindow, calculateSlidingWindowState} from "../utils.test";
import {YEAR_IN_MILLI_SECONDS} from "../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per era", async function () {
      const blockPeriod = 400;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod});
      const self = calculateSlidingWindowState({blockPeriod});
      expect(await slidingWindow.getBlockPerEra()).to.equal(self._blockPerEra);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize});
      expect(await slidingWindow.getBlockPerSlot()).to.equal(self._blockPerSlot);
    });

    it("[HAPPY] query slot per era", async function () {
      const slotSize = 4;
      const {slidingWindow} = await deploySlidingWindow({slotSize});
      const self = calculateSlidingWindowState({slotSize});
      expect(await slidingWindow.getSlotPerEra()).to.equal(self._slotSize);
    });

    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 8;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[HAPPY] query frame size in era length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 8;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInEraLength()).to.equal(self._frameSizeInEraAndSlotLength[0]);
    });

    it("[HAPPY] query frame size in era length when token expire in first era", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInEraLength()).to.equal(self._frameSizeInEraAndSlotLength[0]);
    });

    it("[HAPPY] query frame size in slot length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 8;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInSlotLength()).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[HAPPY] query frame size in slot length when token expire in first era", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInSlotLength()).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[HAPPY] query frame size in era and slot length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 8;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      const getFrameSizeInEraAndSlotLength = await slidingWindow.getFrameSizeInEraAndSlotLength();
      expect(getFrameSizeInEraAndSlotLength.length).to.equal(self._frameSizeInEraAndSlotLength.length);
      expect(getFrameSizeInEraAndSlotLength[0]).to.equal(self._frameSizeInEraAndSlotLength[0]);
      expect(getFrameSizeInEraAndSlotLength[1]).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[HAPPY] query frame size in era and slot length when token expire in first era", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      const getFrameSizeInEraAndSlotLength = await slidingWindow.getFrameSizeInEraAndSlotLength();
      expect(getFrameSizeInEraAndSlotLength.length).to.equal(self._frameSizeInEraAndSlotLength.length);
      expect(getFrameSizeInEraAndSlotLength[0]).to.equal(self._frameSizeInEraAndSlotLength[0]);
      expect(getFrameSizeInEraAndSlotLength[1]).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });
  });
};
