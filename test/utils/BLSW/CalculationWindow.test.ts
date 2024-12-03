import {expect} from "chai";
import {deployBLSW} from "./utils.test";
import {network} from "hardhat";
import {skipToBlock} from "../../utils.test";

export const run = async () => {
  describe("CalculationWindow", async function () {
    beforeEach(async function () {
      await network.provider.send("hardhat_reset");
    });

    it("[HAPPY] calculate correctly window from current block number", async function () {
      const {slidingWindow} = await deployBLSW({startBlockNumber: 1});
      const blocks = await slidingWindow.blocksInEpoch();
      await skipToBlock(blocks);
      const [from, to] = await slidingWindow.window(blocks + 1);
      expect(from).to.equal(0);
      expect(to).to.equal(1);
    });

    it("[HAPPY] calculate correctly window from randomness block number", async function () {
      const {slidingWindow} = await deployBLSW({startBlockNumber: 1});
      const epochs = Math.floor(Math.random() * 101);
      const blocks = await slidingWindow.blocksInEpoch() * epochs;
      await skipToBlock(blocks);
      const [from, to] = await slidingWindow.window(blocks + 1);
      expect(from).to.equal(0);
      expect(to).to.equal(1);
    });
  });
};
