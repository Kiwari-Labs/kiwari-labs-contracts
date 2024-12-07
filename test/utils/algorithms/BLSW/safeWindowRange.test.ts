import {expect} from "chai";
import {deployBLSW} from "./deployer.test";
import {hardhat_latestBlock, hardhat_mine, hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("CalculationSafeFrame", async function () {
    beforeEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] calculate correctly safe window from current block number", async function () {
      const {slidingWindow} = await deployBLSW({startBlockNumber: 1});
      const blocks = (await slidingWindow.blocksInEpoch()) * 4;
      await hardhat_mine(blocks);
      const [from, to] = await slidingWindow.safeWindowRange(blocks);
      expect(from).to.equal(1);
      expect(to).to.equal(3);
    });

    it("[SUCCESS] calculate correctly safe window from randomness block number", async function () {
      const {slidingWindow} = await deployBLSW({startBlockNumber: 1});
      const epochs = Math.floor(Math.random() * 10);
      const blocks = (await slidingWindow.blocksInEpoch()) * epochs;
      await hardhat_mine(blocks);
      const latestBlock = await hardhat_latestBlock();
      const [from, to] = await slidingWindow.safeWindowRange(blocks);
      const blocksInWindow = await slidingWindow.blocksInWindow();
      let fromEpoch;
      if (latestBlock > blocksInWindow) {
        fromEpoch = await slidingWindow.epoch(latestBlock - blocksInWindow);
      } else {
        fromEpoch = await slidingWindow.epoch(0);
      }
      const toEpoch = await slidingWindow.epoch(latestBlock);
      expect(from).to.equal(fromEpoch);
      expect(to).to.equal(toEpoch);
    });
  });
};
