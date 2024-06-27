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

    it("[HAPPY] get era and slot", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      /* 
        blockPerEra = 78892315
        blockPerSlot = 19723078
        frameSizeInBlockLength = 39446156
        slotSize = 4
      */

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber: 100, blockPeriod, slotSize, frameSize});

      const blockNumber = 82892315;

      const [era, slot] = await slidingWindow.getCurrentEraAndSlot(blockNumber);

      expect(era).to.equal(1);
      expect(slot).to.equal(0);
    });

    it("[HAPPY] calculate the frame correctly", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      /* 
        blockPerEra = 78892315
        blockPerSlot = 19723078
        frameSizeInBlockLength = 39446156
        slotSize = 4
      */

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber: 100, blockPeriod, slotSize, frameSize});

      const blockNumber = 82892315;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.getFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.getCurrentEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);
      expect(fromEra).to.equal(0);
      expect(fromSlot).to.equal(2);
    });

    it("[HAPPY] calculate the frame correctly (if blockNumber less than frameSizeInBlockLengthCache)", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      /* 
        blockPerEra = 78892315
        blockPerSlot = 19723078
        frameSizeInBlockLength = 39446156
        slotSize = 4
      */

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber: 100, blockPeriod, slotSize, frameSize});

      const blockNumber = 35446156;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.getFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.getCurrentEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);
      expect(fromEra).to.equal(0);
      expect(fromSlot).to.equal(0);
    });

    it("[HAPPY] calculate the safe frame correctly (if era equal to 0)", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      /* 
        blockPerEra = 78892315
        blockPerSlot = 19723078
        frameSizeInBlockLength = 39446156
        slotSize = 4
      */

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber: 100, blockPeriod, slotSize, frameSize});

      const blockNumber = 78892315;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.getSafeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.getCurrentEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);
      expect(fromEra).to.equal(0);
      expect(fromSlot).to.equal(1);
    });

    it("[HAPPY] calculate the safe frame correctly (if era and slot are more than 0, but slot is not less than slotPerEraCache)", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      /* 
        blockPerEra = 78892315
        blockPerSlot = 19723078
        frameSizeInBlockLength = 39446156
        slotSize = 4
      */

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber: 100, blockPeriod, slotSize, frameSize});

      const blockNumber = 187784800;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.getSafeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.getCurrentEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);
      expect(fromSlot).to.equal(3);
      expect(fromEra).to.equal(0);
    });

    it("[HAPPY] calculate the safe frame correctly (if era and slot are more than 0, and slot is more than slotPerEraCache)", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      /* 
        blockPerEra = 78892315
        blockPerSlot = 19723078
        frameSizeInBlockLength = 39446156
        slotSize = 4
      */

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber: 100, blockPeriod, slotSize, frameSize});

      const blockNumber = 167784800;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.getSafeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.getCurrentEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);
      expect(fromSlot).to.equal(1);
      expect(fromEra).to.equal(1);
    });

    it("[UNHAPPY] revert with InvalidBlockTime (less than minimum)", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 100;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const invalidBlockTime = 10;

      await expect(slidingWindow.updateWindow(invalidBlockTime, frameSize, slotSize)).to.be.revertedWithCustomError(
        slidingWindow,
        "InvalidBlockTime",
      );
    });

    it("[UNHAPPY] revert with InvalidBlockTime (more than maximum)", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 100;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const invalidBlockTime = 600_001;

      await expect(slidingWindow.updateWindow(invalidBlockTime, frameSize, slotSize)).to.be.revertedWithCustomError(
        slidingWindow,
        "InvalidBlockTime",
      );
    });

    it("[UNHAPPY] revert with InvalidFrameSize (less than minimum)", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 100;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const invalidFrameSize = 0;

      await expect(
        slidingWindow.updateWindow(startBlockNumber, invalidFrameSize, slotSize),
      ).to.be.revertedWithCustomError(slidingWindow, "InvalidFrameSize");
    });

    it("[UNHAPPY] revert with InvalidFrameSize (more than maximum)", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 100;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const invalidFrameSize = 65;

      await expect(
        slidingWindow.updateWindow(startBlockNumber, invalidFrameSize, slotSize),
      ).to.be.revertedWithCustomError(slidingWindow, "InvalidFrameSize");
    });

    it("[UNHAPPY] revert with InvalidSlotPerEra (less than minimum)", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 100;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const InvalidSlotPerEra = 0;

      await expect(
        slidingWindow.updateWindow(startBlockNumber, frameSize, InvalidSlotPerEra),
      ).to.be.revertedWithCustomError(slidingWindow, "InvalidSlotPerEra");
    });

    it("[UNHAPPY] revert with InvalidSlotPerEra (more than maximum)", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const startBlockNumber = 100;

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const InvalidSlotPerEra = 13;

      await expect(
        slidingWindow.updateWindow(startBlockNumber, frameSize, InvalidSlotPerEra),
      ).to.be.revertedWithCustomError(slidingWindow, "InvalidSlotPerEra");
    });
  });
};
