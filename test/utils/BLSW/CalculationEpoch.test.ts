import {expect} from "chai";
import {deployBLSW} from "./utils.test";

export const run = async () => {
  describe("CalculationEpochAndSlot", async function () {
    it("[HAPPY] calculate correctly epoch and slot if the current block is in the first slot period of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly epoch and slot if the current block is in the second slot period of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly epoch and slot if the current block is in the third slot period of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly epoch and slot if the current block is in the fourth slot period of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly epoch and slot if the current block is in the first slot period of the second epoch", async function () {
      // TODO
    });

    // Skip the cases below.
    // Reason: https://github.com/MASDXI/ERC20EXP/pull/20#issuecomment-2206762148

    // it("[HAPPY] calculate correctly epoch and slot if the current block is in the last day period of the first epoch", async function () {
    //   const startBlockNumber = 100;
    //   const blockPeriod = 400;
    //   const slotSize = 4;
    //   const frameSize = 2;
    //   const blockPeriodEpoch = 78892315;

    //   // blocks in year equal to 78892315 since blocktime equal to 400ms.
    //   // |-------------- 78892315 --------------|   <-- epoch 1.
    //   // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
    //   //     [0]       [1]       [2]       [3]
    //   //                                        ^
    //   //                                        |
    //   //                                        |
    //   //                                        * <-- the current block.

    //   const {slidingWindow} = await deployBLSW({startBlockNumber, blockPeriod, slotSize, frameSize});

    //   const blockNumberList = [
    //     blockPeriodEpoch + startBlockNumber - 3,
    //     blockPeriodEpoch + startBlockNumber - 2,
    //     blockPeriodEpoch + startBlockNumber - 1,
    //     blockPeriodEpoch + startBlockNumber + 0,
    //     // -------------------------
    //     // blockPeriodEpoch + startBlockNumber + 1,
    //     // blockPeriodEpoch + startBlockNumber + 2,
    //     // blockPeriodEpoch + startBlockNumber + 3,
    //     // blockPeriodEpoch + startBlockNumber + 4,
    //   ];

    //   for (let i = 0; i < blockNumberList.length; i++) {
    //     const [epoch, slot] = await slidingWindow.calculateEpochAndSlot(blockNumberList[i]);
    //     expect(epoch).to.equal(0);
    //     expect(slot).to.equal(3);
    //   }
    // });

    // it("[HAPPY] calculate correctly epoch and slot if the current block is in the first day period of the second epoch", async function () {
    //   const startBlockNumber = 100;
    //   const blockPeriod = 400;
    //   const slotSize = 4;
    //   const frameSize = 2;
    //   const blockPeriodEpoch = 78892315;

    //   // blocks in year equal to 78892315 since blocktime equal to 400ms.
    //   // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
    //   // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
    //   //     [0]       [1]       [2]       [3]       [0]       [1]       [2]       [3]
    //   //                                          ^
    //   //                                          |
    //   //                                          |
    //   //                                          * <-- the current block.

    //   const {slidingWindow} = await deployBLSW({startBlockNumber, blockPeriod, slotSize, frameSize});

    //   const blockNumberList = [
    //     // blockPeriodEpoch + startBlockNumber - 3,
    //     // blockPeriodEpoch + startBlockNumber - 2,
    //     // blockPeriodEpoch + startBlockNumber - 1,
    //     // blockPeriodEpoch + startBlockNumber + 0,
    //     // -------------------------
    //     blockPeriodEpoch + startBlockNumber + 1,
    //     blockPeriodEpoch + startBlockNumber + 2,
    //     blockPeriodEpoch + startBlockNumber + 3,
    //     blockPeriodEpoch + startBlockNumber + 4,
    //   ];

    //   for (let i = 0; i < blockNumberList.length; i++) {
    //     const [epoch, slot] = await slidingWindow.calculateEpochAndSlot(blockNumberList[i]);
    //     expect(epoch).to.equal(1);
    //     expect(slot).to.equal(0);
    //   }
    // });
  });
};
