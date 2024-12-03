import {expect} from "chai";
import {deployBLSW} from "./utils.test";

export const run = async () => {
  describe("CalculationFrame", async function () {
    it("[HAPPY] calculate correctly frame if the current block is in the first slot period of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly frame if the current block is in the second slot period of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly frame if the current block is in the third slot period of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly frame if the current block is in the fourth slot period of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly frame if the current block is in the first slot period of the second epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly frame if the current block is in the second slot period of the second epoch", async function () {
      // TODO
    });

    // Skip the cases below.
    // Reason: https://github.com/MASDXI/ERC20EXP/pull/20#issuecomment-2206762148

    // it("[HAPPY] calculate correctly frame if the current block is in the last day period of the first epoch", async function () {
    //   const startBlockNumber = 100;
    //   const blockPeriod = 400;
    //   const slotSize = 4;
    //   const frameSize = 2;
    //   const blockPeriodEpoch = 78892315;

    //   // blocks in year equal to 78892315 since blocktime equal to 400ms.
    //   // |-------------- 78892315 --------------|   <-- epoch 1.
    //   //                     [-----39446156-----]   <-- windows size equal to 2 slot.
    //   //           x----------------------------x
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
    //     const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow.frame(blockNumberList[i]);
    //     const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumberList[i]);

    //     expect(toEpoch).to.equal(curEpoch);
    //     expect(toSlot).to.equal(curSlot);

    //     expect(fromEpoch).to.equal(0);
    //     expect(toEpoch).to.equal(0);

    //     expect(fromSlot).to.equal(1);
    //     expect(toSlot).to.equal(3);
    //   }
    // });

    // it("[HAPPY] calculate correctly frame if the current block is in the first day period of the second epoch", async function () {
    //   const startBlockNumber = 100;
    //   const blockPeriod = 400;
    //   const slotSize = 4;
    //   const frameSize = 2;
    //   const blockPeriodEpoch = 78892315;

    //   // blocks in year equal to 78892315 since blocktime equal to 400ms.
    //   // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
    //   //                               [-----39446156-----]                                 <-- windows size equal to 2 slot.
    //   //                     x----------------------------x
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
    //     const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow.frame(blockNumberList[i]);
    //     const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumberList[i]);

    //     expect(toEpoch).to.equal(curEpoch);
    //     expect(toSlot).to.equal(curSlot);

    //     expect(fromEpoch).to.equal(0);
    //     expect(toEpoch).to.equal(1);

    //     expect(fromSlot).to.equal(2);
    //     expect(toSlot).to.equal(0);
    //   }
    // });
  });
};
