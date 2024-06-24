import {expect} from "chai";
import {deploySlidingWindow} from "../utils.test";
import {YEAR_IN_MILLI_SECONDS} from "../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per era", async function () {
      const blockPeriod = 400;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod});
      expect(await slidingWindow.getBlockPerEra()).to.equal(YEAR_IN_MILLI_SECONDS / blockPeriod);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize});
      // Why 'Math.floor', Since Solidity always rounds down.
      const blockPerEra = Math.floor(YEAR_IN_MILLI_SECONDS / blockPeriod);
      expect(await slidingWindow.getBlockPerSlot()).to.equal(Math.floor(blockPerEra / slotSize));
    });

    it("[HAPPY] query slot per era", async function () {
      const slotSize = 4;
      const {slidingWindow} = await deploySlidingWindow({slotSize});
      expect(await slidingWindow.getSlotPerEra()).to.equal(slotSize);
    });
    
    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 8;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const blockPerEra = Math.floor(YEAR_IN_MILLI_SECONDS / blockPeriod);
      const blockPerSlot = Math.floor(blockPerEra / slotSize);
      expect(await slidingWindow.getFrameSizeInBlockLength()).to.equal(blockPerSlot * frameSize);
    });

    it("[HAPPY] query frame size in era length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 8;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInEraLength()).to.equal(Math.floor(frameSize / slotSize));
    });

    it("[HAPPY] query frame size in era length when token expire in first era", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInEraLength()).to.equal(0);
    });

    it("[HAPPY] query frame size in slot length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 8;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInSlotLength()).to.equal(frameSize % slotSize);
    });

    it("[HAPPY] query frame size in slot length when token expire in first era", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      expect(await slidingWindow.getFrameSizeInSlotLength()).to.equal(frameSize % slotSize);
    });

    it("[HAPPY] query frame size in era and slot length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 8;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const getFrameSizeInEraAndSlotLength = await slidingWindow.getFrameSizeInEraAndSlotLength();
      expect(getFrameSizeInEraAndSlotLength[0]).to.equal(Math.floor(frameSize / slotSize));
      expect(getFrameSizeInEraAndSlotLength[1]).to.equal(frameSize % slotSize);
    });

    it("[HAPPY] query frame size in era and slot length when token expire in first era", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const {slidingWindow} = await deploySlidingWindow({blockPeriod, slotSize, frameSize});
      const getFrameSizeInEraAndSlotLength = await slidingWindow.getFrameSizeInEraAndSlotLength();
      expect(getFrameSizeInEraAndSlotLength[0]).to.equal(0);
      expect(getFrameSizeInEraAndSlotLength[1]).to.equal(frameSize % slotSize);
    });
  });
};
