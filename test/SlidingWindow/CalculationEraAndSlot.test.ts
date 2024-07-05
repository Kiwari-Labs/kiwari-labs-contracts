import {expect} from "chai";
import {deploySlidingWindow} from "../utils.test";

export const run = async () => {
  describe("CalculationEraAndSlot", async function () {
    it("[HAPPY] correct calculate era and slot if the current block is in the first slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

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
        Math.floor(blockPeriodSlot * 0.25) + startBlockNumber,
        Math.floor(blockPeriodSlot * 0.5) + startBlockNumber,
        Math.floor(blockPeriodSlot * 0.75) + startBlockNumber,
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(0);
        expect(slot).to.equal(0);
      }
    });

    it("[HAPPY] correct calculate era and slot if the current block is in the second slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

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
        Math.floor(blockPeriodSlot * 1.25) + startBlockNumber,
        Math.floor(blockPeriodSlot * 1.5) + startBlockNumber,
        Math.floor(blockPeriodSlot * 1.75) + startBlockNumber,
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(0);
        expect(slot).to.equal(1);
      }
    });

    it("[HAPPY] correct calculate era and slot if the current block is in the third slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

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
        Math.floor(blockPeriodSlot * 2.25) + startBlockNumber,
        Math.floor(blockPeriodSlot * 2.5) + startBlockNumber,
        Math.floor(blockPeriodSlot * 2.75) + startBlockNumber,
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(0);
        expect(slot).to.equal(2);
      }
    });

    it("[HAPPY] correct calculate era and slot if the current block is in the fourth slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

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
        Math.floor(blockPeriodSlot * 3.25) + startBlockNumber,
        Math.floor(blockPeriodSlot * 3.5) + startBlockNumber,
        Math.floor(blockPeriodSlot * 3.75) + startBlockNumber,
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(0);
        expect(slot).to.equal(3);
      }
    });

    it("[HAPPY] correct calculate era and slot if the current block is in the first slot period of the second era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]       [0]       [1]       [2]       [3]
      //                                            ^
      //                                            |
      //                                            |
      //                                            * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumberList = [
        Math.floor(blockPeriodSlot * 4.25) + startBlockNumber,
        Math.floor(blockPeriodSlot * 4.5) + startBlockNumber,
        Math.floor(blockPeriodSlot * 4.75) + startBlockNumber,
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
        expect(era).to.equal(1);
        expect(slot).to.equal(0);
      }
    });


    // Skip the cases below. 
    // Reason: https://github.com/MASDXI/ERC20EXP/pull/20#issuecomment-2206762148

    // it("[HAPPY] correct calculate era and slot if the current block is in the last day period of the first era", async function () {
    //   const startBlockNumber = 100;
    //   const blockPeriod = 400;
    //   const slotSize = 4;
    //   const frameSize = 2;
    //   const blockPeriodEra = 78892315;

    //   // blocks in year equl to 78892315 since blocktime equl to 400ms.
    //   // |-------------- 78892315 --------------|   <-- era 1.
    //   // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
    //   //     [0]       [1]       [2]       [3]
    //   //                                        ^
    //   //                                        |
    //   //                                        |
    //   //                                        * <-- the current block.

    //   const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

    //   const blockNumberList = [
    //     blockPeriodEra + startBlockNumber - 3,
    //     blockPeriodEra + startBlockNumber - 2,
    //     blockPeriodEra + startBlockNumber - 1,
    //     blockPeriodEra + startBlockNumber + 0,
    //     // -------------------------
    //     // blockPeriodEra + startBlockNumber + 1,
    //     // blockPeriodEra + startBlockNumber + 2,
    //     // blockPeriodEra + startBlockNumber + 3,
    //     // blockPeriodEra + startBlockNumber + 4,
    //   ];

    //   for (let i = 0; i < blockNumberList.length; i++) {
    //     const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
    //     expect(era).to.equal(0);
    //     expect(slot).to.equal(3);
    //   }
    // });

    // it("[HAPPY] correct calculate era and slot if the current block is in the first day period of the second era", async function () {
    //   const startBlockNumber = 100;
    //   const blockPeriod = 400;
    //   const slotSize = 4;
    //   const frameSize = 2;
    //   const blockPeriodEra = 78892315;

    //   // blocks in year equl to 78892315 since blocktime equl to 400ms.
    //   // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
    //   // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
    //   //     [0]       [1]       [2]       [3]       [0]       [1]       [2]       [3]
    //   //                                          ^
    //   //                                          |
    //   //                                          |
    //   //                                          * <-- the current block.

    //   const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

    //   const blockNumberList = [
    //     // blockPeriodEra + startBlockNumber - 3,
    //     // blockPeriodEra + startBlockNumber - 2,
    //     // blockPeriodEra + startBlockNumber - 1,
    //     // blockPeriodEra + startBlockNumber + 0,
    //     // -------------------------
    //     blockPeriodEra + startBlockNumber + 1,
    //     blockPeriodEra + startBlockNumber + 2,
    //     blockPeriodEra + startBlockNumber + 3,
    //     blockPeriodEra + startBlockNumber + 4,
    //   ];

    //   for (let i = 0; i < blockNumberList.length; i++) {
    //     const [era, slot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
    //     expect(era).to.equal(1);
    //     expect(slot).to.equal(0);
    //   }
    // });
  });
};
