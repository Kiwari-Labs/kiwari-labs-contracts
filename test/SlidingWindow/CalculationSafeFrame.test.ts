import {expect} from "chai";
import {deploySlidingWindow} from "../utils.test";

export const run = async () => {
  describe("CalculationSafeFrame", async function () {
    it("[HAPPY] correct calculate safe frame if the current block is in the first slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(0);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the second slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the third slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the fourth slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(3);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the first slot period of the second era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(1);
      expect(toSlot).to.equal(0);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the second slot period of the second era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the third slot period of the second era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(3);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the fourth slot period of the second era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(1);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(3);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the first slot period of the third era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 3.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(1);
      expect(toEra).to.equal(2);

      expect(fromSlot).to.equal(1);
      expect(toSlot).to.equal(0);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the second slot period of the third era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 3.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(1);
      expect(toEra).to.equal(2);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the third slot period of the third era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 3.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(1);
      expect(toEra).to.equal(2);

      expect(fromSlot).to.equal(3);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the fourth slot period of the third era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 3.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(2);
      expect(toEra).to.equal(2);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(3);
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the last day period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodEra = 78892315;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      //                     [-----39446156-----]   <-- windows size equal to 2 slot.
      // x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //                                        ^
      //                                        |
      //                                        |
      //                                        * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumberList = [
        blockPeriodEra + startBlockNumber - 3,
        blockPeriodEra + startBlockNumber - 2,
        blockPeriodEra + startBlockNumber - 1,
        blockPeriodEra + startBlockNumber + 0,
        // -------------------------
        // blockPeriodEra + startBlockNumber + 1,
        // blockPeriodEra + startBlockNumber + 2,
        // blockPeriodEra + startBlockNumber + 3,
        // blockPeriodEra + startBlockNumber + 4,
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumberList[i]);
        const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);

        expect(toEra).to.equal(curEra);
        expect(toSlot).to.equal(curSlot);

        expect(fromEra).to.equal(0);
        expect(toEra).to.equal(0);

        expect(fromSlot).to.equal(0);
        expect(toSlot).to.equal(3);
      }
    });

    it("[HAPPY] correct calculate safe frame if the current block is in the first day period of the second era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;
      const blockPeriodEra = 78892315;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      //                               [-----39446156-----]                                 <-- windows size equal to 2 slot.
      //           x---buf---x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]       [0]       [1]       [2]       [3]
      //                                          ^
      //                                          |
      //                                          |
      //                                          * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumberList = [
        // blockPeriodEra + startBlockNumber - 3,
        // blockPeriodEra + startBlockNumber - 2,
        // blockPeriodEra + startBlockNumber - 1,
        // blockPeriodEra + startBlockNumber + 0,
        // -------------------------
        blockPeriodEra + startBlockNumber + 1,
        blockPeriodEra + startBlockNumber + 2,
        blockPeriodEra + startBlockNumber + 3,
        blockPeriodEra + startBlockNumber + 4,
      ];

      for (let i = 0; i < blockNumberList.length; i++) {
        const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumberList[i]);
        const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);

        expect(toEra).to.equal(curEra);
        expect(toSlot).to.equal(curSlot);

        expect(fromEra).to.equal(0);
        expect(toEra).to.equal(1);

        expect(fromSlot).to.equal(1);
        expect(toSlot).to.equal(0);
      }
    });

    it("[HAPPY] correct calculate safe frame if frame size equal to 3 and slot size equal to 4", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 3;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
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

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] correct calculate safe frame if frame size equal to 3 and slot size equal to 4 when the frame is in between both era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 3;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      //                               [----------59169234----------]                       <-- windows size equal to 2 slot.
      //           x---buf---x--------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                      ^
      //                                                      |
      //                                                      |
      //                                                      * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 5.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(1);
      expect(toSlot).to.equal(1);
    });
    
    it("[HAPPY] correct calculate safe frame if frame size equal to slot size", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 4;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      //                                         [-------------- 78892315 --------------]   <-- windows size equal to 2 slot.
      //                     x---buf---x------------------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                                          ^
      //                                                                          |
      //                                                                          |
      //                                                                          * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 7.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(3);
    });

    it("[HAPPY] correct calculate safe frame if frame size equal to slot size when the frame is in between both era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 4;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      //                     [-------------- 78892315 --------------]                       <-- windows size equal to 2 slot.
      // x---buf---x------------------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                      ^
      //                                                      |
      //                                                      |
      //                                                      * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 5.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] correct calculate safe frame if frame size equal to 5 and slot size equal to 4", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 5;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      //                     [------------------- 59169234 -------------------]             <-- windows size equal to 2 slot.
      // x---buf---x----------------------------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                                ^
      //                                                                |
      //                                                                |
      //                                                                * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 6.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] correct calculate safe frame if frame size equal to 5 and slot size equal to 4 when the current block is in third era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 5;
      const blockPeriodSlot = 19723078;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 3.
      //                                                                       [------------------- 59169234 -------------------]   <-- windows size equal to 2 slot.
      //                                                   x---buf---x----------------------------------------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 12 slot.
      //     [0]       [1]       [2]       [3]       [0]       [1]       [2]       [3]       [0]       [1]       [2]       [3]
      //                                                                                                                  ^
      //                                                                                                                  |
      //                                                                                                                  |
      //                                                                                                                  * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 11.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.safeFrame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(1);
      expect(toEra).to.equal(2);

      expect(fromSlot).to.equal(1);
      expect(toSlot).to.equal(3);
    });
  });
};
