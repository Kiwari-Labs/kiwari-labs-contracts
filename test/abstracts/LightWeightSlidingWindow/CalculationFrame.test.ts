import {expect} from "chai";
import {deployLightWeightSlidingWindow} from "../../utils.test";

export const run = async () => {
  describe("CalculationFrame", async function () {
    it("[HAPPY] calculate correctly frame if the current block is in the first slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // [-----39446156-----]                       <-- windows size equal to 2 slot.
      // ---------x
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //    ^
      //    |
      //    |
      //    * <-- the current block.

      const {slidingWindow} = await deployLightWeightSlidingWindow({startBlockNumber, blockPeriod, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 0.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow["frame(uint256)"](blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(0);
    });

    it("[HAPPY] calculate correctly frame if the current block is in the second slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // [-----39446156-----]                       <-- windows size equal to 2 slot.
      // -------------------x
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //              ^
      //              |
      //              |
      //              * <-- the current block.

      const {slidingWindow} = await deployLightWeightSlidingWindow({startBlockNumber, blockPeriod, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 1.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow["frame(uint256)"](blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] calculate correctly frame if the current block is in the third slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      //           [-----39446156-----]             <-- windows size equal to 2 slot.
      // x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //                        ^
      //                        |
      //                        |
      //                        * <-- the current block.

      const {slidingWindow} = await deployLightWeightSlidingWindow({startBlockNumber, blockPeriod, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 2.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow["frame(uint256)"](blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(0);

      expect(fromSlot).to.equal(0);
      expect(toSlot).to.equal(2);
    });

    it("[HAPPY] calculate correctly frame if the current block is in the fourth slot period of the first era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      //                     [-----39446156-----]   <-- windows size equal to 2 slot.
      //           x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //                                  ^
      //                                  |
      //                                  |
      //                                  * <-- the current block.

      const {slidingWindow} = await deployLightWeightSlidingWindow({startBlockNumber, blockPeriod, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 3.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow["frame(uint256)"](blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(0);

      expect(fromSlot).to.equal(1);
      expect(toSlot).to.equal(3);
    });

    it("[HAPPY] calculate correctly frame if the current block is in the first slot period of the second era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      //                               [-----39446156-----]                                 <-- windows size equal to 2 slot.
      //                     x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                            ^
      //                                            |
      //                                            |
      //                                            * <-- the current block.

      const {slidingWindow} = await deployLightWeightSlidingWindow({startBlockNumber, blockPeriod, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 4.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow["frame(uint256)"](blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(0);
    });

    it("[HAPPY] calculate correctly frame if the current block is in the second slot period of the second era", async function () {
      const startBlockNumber = 100;
      const blockPeriod = 400;
      const frameSize = 2;
      const blockPeriodSlot = 19723078;

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
      //                                         [-----39446156-----]                       <-- windows size equal to 2 slot.
      //                               x----------------------------x
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
      //     [0]       [1]       [2]       [3]        [0]       [1]       [2]       [3]
      //                                                      ^
      //                                                      |
      //                                                      |
      //                                                      * <-- the current block.

      const {slidingWindow} = await deployLightWeightSlidingWindow({startBlockNumber, blockPeriod, frameSize});

      const blockNumber = Math.floor(blockPeriodSlot * 5.5) + startBlockNumber;

      const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow["frame(uint256)"](blockNumber);
      const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumber);

      expect(toEra).to.equal(curEra);
      expect(toSlot).to.equal(curSlot);

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(3);
      expect(toSlot).to.equal(1);
    });

    // Skip the cases below.
    // Reason: https://github.com/MASDXI/ERC20EXP/pull/20#issuecomment-2206762148

    // it("[HAPPY] calculate correctly frame if the current block is in the last day period of the first era", async function () {
    //   const startBlockNumber = 100;
    //   const blockPeriod = 400;
    //   const frameSize = 2;
    //   const blockPeriodEra = 78892315;

    //   // blocks in year equal to 78892315 since blocktime equal to 400ms.
    //   // |-------------- 78892315 --------------|   <-- era 1.
    //   //                     [-----39446156-----]   <-- windows size equal to 2 slot.
    //   //           x----------------------------x
    //   // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
    //   //     [0]       [1]       [2]       [3]
    //   //                                        ^
    //   //                                        |
    //   //                                        |
    //   //                                        * <-- the current block.

    //   const {slidingWindow} = await deployLightWeightSlidingWindow({startBlockNumber, blockPeriod, frameSize});

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
    //     const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.frame(blockNumberList[i]);
    //     const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);

    //     expect(toEra).to.equal(curEra);
    //     expect(toSlot).to.equal(curSlot);

    //     expect(fromEra).to.equal(0);
    //     expect(toEra).to.equal(0);

    //     expect(fromSlot).to.equal(1);
    //     expect(toSlot).to.equal(3);
    //   }
    // });

    // it("[HAPPY] calculate correctly frame if the current block is in the first day period of the second era", async function () {
    //   const startBlockNumber = 100;
    //   const blockPeriod = 400;
    //   const frameSize = 2;
    //   const blockPeriodEra = 78892315;

    //   // blocks in year equal to 78892315 since blocktime equal to 400ms.
    //   // |-------------- 78892315 --------------||-------------- 78892315 --------------|   <-- era 2.
    //   //                               [-----39446156-----]                                 <-- windows size equal to 2 slot.
    //   //                     x----------------------------x
    //   // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}   <-- 8 slot.
    //   //     [0]       [1]       [2]       [3]       [0]       [1]       [2]       [3]
    //   //                                          ^
    //   //                                          |
    //   //                                          |
    //   //                                          * <-- the current block.

    //   const {slidingWindow} = await deployLightWeightSlidingWindow({startBlockNumber, blockPeriod, frameSize});

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
    //     const [fromEra, toEra, fromSlot, toSlot] = await slidingWindow.frame(blockNumberList[i]);
    //     const [curEra, curSlot] = await slidingWindow.calculateEraAndSlot(blockNumberList[i]);

    //     expect(toEra).to.equal(curEra);
    //     expect(toSlot).to.equal(curSlot);

    //     expect(fromEra).to.equal(0);
    //     expect(toEra).to.equal(1);

    //     expect(fromSlot).to.equal(2);
    //     expect(toSlot).to.equal(0);
    //   }
    // });
  });
};
