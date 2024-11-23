import {expect} from "chai";
import {deploySlidingWindow} from "./utils.test";

export const run = async () => {
  describe("CalculationSafeFrame", async function () {
    it("[HAPPY] calculate correctly safe frame if the current block is in the first slot period of the first epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // [-----39446156-----]                       <-- windows size equal to 2 slot.
      // ---------x
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //    ^
      //    |
      //    |
      //    * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 0.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(0);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the second slot period of the first epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // [-----39446156-----]                       <-- windows size equal to 2 slot.
      // -------------------x
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //              ^
      //              |
      //              |
      //              * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 1.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the third slot period of the first epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      //           [-----39446156-----]             <-- windows size equal to 2 slot.
      // x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //                        ^
      //                        |
      //                        |
      //                        * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 2.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the fourth slot period of the first epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      //                     [-----39446156-----]   <-- windows size equal to 2 slot.
      // x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //                                  ^
      //                                  |
      //                                  |
      //                                  * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 3.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(3);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the first slot period of the second epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
      //                               [-----39446156-----]                                 <-- windows size equal to 2 slot.
      //           x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                            ^
      //                                            |
      //                                            |
      //                                            * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 4.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(1);
      expect(toSlot).to.equal(0);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the second slot period of the second epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
      //                                         [-----39446156-----]                       <-- windows size equal to 2 slot.
      //                     x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                      ^
      //                                                      |
      //                                                      |
      //                                                      * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 5.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the third slot period of the second epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
      //                                                   [-----39446156-----]             <-- windows size equal to 2 slot.
      //                               x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                                ^
      //                                                                |
      //                                                                |
      //                                                                * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 6.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(3);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the fourth slot period of the second epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
      //                                                             [-----39446156-----]   <-- windows size equal to 2 slot.
      //                                         x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                                          ^
      //                                                                          |
      //                                                                          |
      //                                                                          * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 7.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(1);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(3);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the first slot period of the third epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 3.
      //                                                                       [-----39446156-----]                                 <-- windows size equal to 2 slot.
      //                                                   x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 12 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]      [0]       [1]       [2]       [3]
      //                                                                                    ^
      //                                                                                    |
      //                                                                                    |
      //                                                                                    * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 8.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(1);
      expect(toEpoch).to.equal(2);

      expect(fromSlot).to.equal(1);
      expect(toSlot).to.equal(0);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the second slot period of the third epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 3.
      //                                                                                 [-----39446156-----]                       <-- windows size equal to 2 slot.
      //                                                             x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 12 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]      [0]       [1]       [2]       [3]
      //                                                                                              ^
      //                                                                                              |
      //                                                                                              |
      //                                                                                              * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 9.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(1);
      expect(toEpoch).to.equal(2);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the third slot period of the third epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 3.
      //                                                                                           [-----39446156-----]             <-- windows size equal to 2 slot.
      //                                                                       x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 12 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]      [0]       [1]       [2]       [3]
      //                                                                                                        ^
      //                                                                                                        |
      //                                                                                                        |
      //                                                                                                        * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 10.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(1);
      expect(toEpoch).to.equal(2);

      expect(fromSlot).to.equal(3);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] calculate correctly safe frame if the current block is in the fourth slot period of the third epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 3.
      //                                                                                                     [-----39446156-----]   <-- windows size equal to 2 slot.
      //                                                                                 x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 12 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]      [0]       [1]       [2]       [3]
      //                                                                                                                  ^
      //                                                                                                                  |
      //                                                                                                                  |
      //                                                                                                                  * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 11.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(2);
      expect(toEpoch).to.equal(2);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(3);
    });

    it("[HAPPY] calculate correctly safe frame if frame size equal to 3 and slot size equal to 4", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 3;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
      //                                         [----------59169234----------]             <-- windows size equal to 2 slot.
      //                     x---buf---x--------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                                ^
      //                                                                |
      //                                                                |
      //                                                                * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 6.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] calculate correctly safe frame if frame size equal to 3 and slot size equal to 4 when the frame is in between both epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 3;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
      //                               [----------59169234----------]                       <-- windows size equal to 3 slot.
      //           x---buf---x--------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                      ^
      //                                                      |
      //                                                      |
      //                                                      * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 5.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(1);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] calculate correctly safe frame if frame size equal to slot size", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 4;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
      //                                         [-------------- 78892315 --------------]   <-- windows size equal to 4 slot.
      //                     x---buf---x------------------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                                          ^
      //                                                                          |
      //                                                                          |
      //                                                                          * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 7.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(3);
    });

    it("[HAPPY] calculate correctly safe frame if frame size equal to slot size when the frame is in between both epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 4;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
      //                     [-------------- 78892315 --------------]                       <-- windows size equal to 4 slot.
      // x---buf---x------------------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                      ^
      //                                                      |
      //                                                      |
      //                                                      * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 5.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] calculate correctly safe frame if frame size equal to 5 and slot size equal to 4", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 5;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
      //                     [------------------- 98615390 -------------------]             <-- windows size equal to 5 slot.
      // x---buf---x----------------------------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                                ^
      //                                                                |
      //                                                                |
      //                                                                * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 6.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] calculate correctly safe frame if frame size equal to 5 and slot size equal to 4 when the current block is in third epoch", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 5;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 3.
      //                                                                       [------------------- 98615390 -------------------]   <-- windows size equal to 5 slot.
      //                                                   x---buf---x----------------------------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 12 slot.
      //     [0]       [1]       [2]       [3]       [0]       [1]       [2]       [3]       [0]       [1]       [2]       [3]
      //                                                                                                                  ^
      //                                                                                                                  |
      //                                                                                                                  |
      //                                                                                                                  * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 11.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(1);
      expect(toEpoch).to.equal(2);

      expect(fromSlot).to.equal(1);
      expect(toSlot).to.equal(3);
    });

    it("[HAPPY] calculate correctly safe frame if frame size equal to 3 and slot size equal to 5", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 5;
      const frameSize = 3;
      const blockPeriodSlot = 15778463;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |------------------- 78892315 -------------------||------------------- 78892315 -------------------|   <-- epoch 2.
      //                               [--------- 47335389 ---------]                                           <-- windows size equal to 3 slot.
      //           x---buf---x--------------------------------------x
      // {15778463}{15778463}{15778463}{15778463}{15778463}{15778463}{15778463}{15778463}{15778463}{15778463}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]       [4]       [0]       [1]       [2]       [3]       [4]
      //                                                      ^
      //                                                      |
      //                                                      |
      //                                                      * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 5.5) + startBlockNumber;

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow["safeFrame(uint256)"](blockNumber);
      const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumber);

      expect(toEpoch).to.equal(curEpoch);
      expect(toSlot).to.equal(curSlot);

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(1);
      expect(toSlot).to.equal(0);
    });

    // Skip the cases below.
    // Reason: https://github.com/MASDXI/ERC20EXP/pull/20#issuecomment-2206762148

    // it("[HAPPY] calculate correctly safe frame if the current block is in the last day period of the first epoch", async function () {
    //   const startBlockNumber = 100;
    //   const blockPeriod = 400;
    //   const slotSize = 4;
    //   const frameSize = 2;
    //   const blockPeriodEpoch = 78892315;

    //   // blocks in year equal to 78892315 since blocktime equal to 400ms.
    //   // |-------------- 78892315 --------------|   <-- epoch 1.
    //   //                     [-----39446156-----]   <-- windows size equal to 2 slot.
    //   // x---buf---x----------------------------x
    //   // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
    //   //     [0]       [1]       [2]       [3]
    //   //                                        ^
    //   //                                        |
    //   //                                        |
    //   //                                        * <-- the current block.

    //   const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

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
    //     const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumberList[i]);
    //     const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumberList[i]);

    //     expect(toEpoch).to.equal(curEpoch);
    //     expect(toSlot).to.equal(curSlot);

    //     expect(fromEpoch).to.equal(0);
    //     expect(toEpoch).to.equal(0);

    //     expect(fromSlot).to.equal(0);
    //     expect(toSlot).to.equal(3);
    //   }
    // });

    // it("[HAPPY] calculate correctly safe frame if the current block is in the first day period of the second epoch", async function () {
    //   const startBlockNumber = 100;
    //   const blockPeriod = 400;
    //   const slotSize = 4;
    //   const frameSize = 2;
    //   const blockPeriodEpoch = 78892315;

    //   // blocks in year equal to 78892315 since blocktime equal to 400ms.
    //   // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- epoch 2.
    //   //                               [-----39446156-----]                                 <-- windows size equal to 3 slot.
    //   //           x---buf---x----------------------------x
    //   // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
    //   //     [0]       [1]       [2]       [3]       [0]       [1]       [2]       [3]
    //   //                                          ^
    //   //                                          |
    //   //                                          |
    //   //                                          * <-- the current block.

    //   const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

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
    //     const [fromEpoch, toEpoch, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumberList[i]);
    //     const [curEpoch, curSlot] = await slidingWindow.calculateEpochAndSlot(blockNumberList[i]);

    //     expect(toEpoch).to.equal(curEpoch);
    //     expect(toSlot).to.equal(curSlot);

    //     expect(fromEpoch).to.equal(0);
    //     expect(toEpoch).to.equal(1);

    //     expect(fromSlot).to.equal(1);
    //     expect(toSlot).to.equal(0);
    //   }
    // });
  });
};
