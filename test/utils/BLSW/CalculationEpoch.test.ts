import {expect} from "chai";
import {deployBLSW} from "./utils.test";
import {network} from "hardhat";
import {skipToBlock} from "../../utils.test";

export const run = async () => {
  describe("CalculationEpoch", async function () {
    beforeEach(async function () {
      await network.provider.send("hardhat_reset");
    });

    it("[HAPPY] calculate correctly epoch if the current block is in the first epoch", async function () {
      const {slidingWindow} = await deployBLSW({startBlockNumber: 1});
      const blocks = await slidingWindow.blocksInEpoch()
      await skipToBlock(blocks);
      expect(await slidingWindow.epoch(blocks + 1)).to.equal(1);
    });

    it("[HAPPY] calculate correctly epoch if the given block is randomness from 1 to 100", async function () {
      const {slidingWindow} = await deployBLSW({startBlockNumber: 1});
      const epochs = Math.floor(Math.random() * 101);
      const blocks = await slidingWindow.blocksInEpoch() * epochs;
      await skipToBlock(blocks);
      expect(await slidingWindow.epoch(blocks + 1)).to.equal(epochs);
    });
  });
};
