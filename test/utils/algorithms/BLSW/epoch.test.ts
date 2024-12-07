import {expect} from "chai";
import {deployBLSW} from "./deployer.test";
import {hardhat_mine, hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("CalculationEpoch", async function () {
    beforeEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] epoch", async function () {
      const {slidingWindow} = await deployBLSW({startBlockNumber: 1});
      const blocks = await slidingWindow.blocksInEpoch();
      await hardhat_mine(blocks);
      expect(await slidingWindow.epoch(blocks + 1)).to.equal(1);
    });
  });
};
