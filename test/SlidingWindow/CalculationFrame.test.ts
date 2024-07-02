import {expect} from "chai";
import {deploySlidingWindow} from "../utils.test";

export const run = async () => {
  describe.only("CalculationFrame", async function () {
    it("[HAPPY] correct calculate frame if the current block is in the second slot period of the first era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

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

      const blockNumber = 19723078 * 1.5;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.frame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] correct calculate frame if the current block is in the third slot period of the first era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

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

      const blockNumber = 19723078 * 2.5;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.frame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] correct calculate frame if the current block is in the second slot period of the second era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      //                                         [-----39446156-----]                       <-- windows size equal to 2 slot.
      //                               x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                      ^
      //                                                      |
      //                                                      |
      //                                                      * <-- the current block.

      const {slidingWindow} = await deploySlidingWindow({startBlockNumber, blockPeriod, slotSize, frameSize});

      const blockNumber = 19723078 * 5.5;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.frame(blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(3);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] correct calculate frame if the current block is in the last day period of the first era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      //                     [-----39446156-----]   <-- windows size equal to 2 slot.
      //           x----------------------------x
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
        const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.frame(blockNumberList[i]);
        const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
  
        expect(toEra).to.equal(curEra);
        expect(toSlot).to.equal(curSlot);
  
        expect(fromEra).to.equal(0);
        expect(toEra).to.equal(0);
  
        expect(fromSlot).to.equal(1);
        expect(toSlot).to.equal(3);
      }
    });

    it("[HAPPY] correct calculate frame if the current block is in the first day period of the second era", async function () {
      const startBlockNumber = 0;
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      // blocks in year equl to 78892315 since blocktime equl to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      //                               [-----39446156-----]                                 <-- windows size equal to 2 slot.
      //                     x----------------------------x
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
        const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.frame(blockNumberList[i]);
        const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);
  
        expect(toEra).to.equal(curEra);
        expect(toSlot).to.equal(curSlot);
  
        expect(fromEra).to.equal(0);
        expect(toEra).to.equal(1);
  
        expect(fromSlot).to.equal(2);
        expect(toSlot).to.equal(4);
      }
    });
  });
};
