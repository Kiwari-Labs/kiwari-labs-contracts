import {expect} from "chai";
import {deploySlidingWindow} from "../utils.test";

export const run = async () => {
  describe("CalculationEraAndSlot", async function () {
    it("[HAPPY] correct calculate era and slot if the current block is in the first slot period of the first era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //    ^
      //    |
      //    |
      //    * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumberList = [
        Math.floor(19723078 * 0),
        Math.floor(19723078 * 0.25),
        Math.floor(19723078 * 0.5),
        Math.floor(19723078 * 0.75),
        Math.floor(19723078 * 1),
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(0);
        expect(slot).to.equal(0);
      }
    });

    it("[HAPPY] correct calculate era and slot if the current block is in the second slot period of the first era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //              ^
      //              |
      //              |
      //              * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumberList = [
        Math.floor(19723078 * 1.25),
        Math.floor(19723078 * 1.5),
        Math.floor(19723078 * 1.75),
        Math.floor(19723078 * 2),
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(0);
        expect(slot).to.equal(1);
      }
    });

    it("[HAPPY] correct calculate era and slot if the current block is in the third slot period of the first era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //                        ^
      //                        |
      //                        |
      //                        * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumberList = [
        Math.floor(19723078 * 2.25),
        Math.floor(19723078 * 2.5),
        Math.floor(19723078 * 2.75),
        Math.floor(19723078 * 3),
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(0);
        expect(slot).to.equal(2);
      }
    });

    it("[HAPPY] correct calculate era and slot if the current block is in the fourth slot period of the first era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //                                  ^
      //                                  |
      //                                  |
      //                                  * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumberList = [
        Math.floor(19723078 * 3.25),
        Math.floor(19723078 * 3.5),
        Math.floor(19723078 * 3.75),
        Math.floor(19723078 * 4),
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(0);
        expect(slot).to.equal(3);
      }
    });

    it("[HAPPY] correct calculate era and slot if the current block is in the first slot period of the second era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]       [4]       [5]       [6]       [7]
      //                                            ^
      //                                            |
      //                                            |
      //                                            * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumberList = [
        Math.floor(19723078 * 4.25),
        Math.floor(19723078 * 4.5),
        Math.floor(19723078 * 4.75),
        Math.floor(19723078 * 5),
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(1);
        expect(slot).to.equal(0);
      }
    });

    it("[HAPPY] correct calculate era and slot if the current block is in the last day period of the first era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //                                        ^
      //                                        |
      //                                        |
      //                                        * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumberList = [
        78892315 - 3, // 78892312
        78892315 - 2, // 78892313
        78892315 - 1, // 78892314
        78892315 + 0, // 78892315     <-- era 1.
        // -------------------------
        // 78892315 + 1, // 78892316  <-- era 2.
        // 78892315 + 2, // 78892317
        // 78892315 + 3, // 78892318
        // 78892315 + 4, // 78892319
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(0);
        expect(slot).to.equal(3);
      }
    });

    it("[HAPPY] correct calculate era and slot if the current block is in the first day period of the second era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]       [4]       [5]       [6]       [7]
      //                                          ^
      //                                          |
      //                                          |
      //                                          * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumberList = [
        // 78892315 - 3, // 78892312
        // 78892315 - 2, // 78892313
        // 78892315 - 1, // 78892314
        // 78892315 + 0, // 78892315     <-- era 1.
        // -------------------------
        78892315 + 1, // 78892316  <-- era 2.
        78892315 + 2, // 78892317
        78892315 + 3, // 78892318
        78892315 + 4, // 78892319
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(0);
        expect(slot).to.equal(4);
      }
    });
  });
};
