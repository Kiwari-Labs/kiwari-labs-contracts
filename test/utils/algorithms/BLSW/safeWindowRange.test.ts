import {expect} from "chai";
import {deployBLSW} from "./deployer.test";
import {hardhat_latestBlock, hardhat_mine, hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("SafeWindowRange", async function () {
    beforeEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] safeWindowRange from current block number", async function () {
      const {slidingWindow} = await deployBLSW({});
      const blocks = Number(await slidingWindow.blocksInEpoch());
      await hardhat_mine(blocks);
      const latestBlock = await hardhat_latestBlock();
      const [from, to] = await slidingWindow.safeWindowRange(latestBlock);
      expect(from).to.equal(0);
      expect(to).to.equal(1);
    });

    it("[SUCCESS] safeWindowRange after `n` blocks", async function () {
      const {slidingWindow} = await deployBLSW({});
      const epochs = Number(await slidingWindow.windowSize());
      const blocks = Number(await slidingWindow.blocksInEpoch()) * epochs;
      await hardhat_mine(blocks);
      const latestBlock = Number(await hardhat_latestBlock());
      const blocksInWindow = Number(await slidingWindow.blocksInWindow());
      const [from, to] = await slidingWindow.safeWindowRange(latestBlock);
      const fromEpoch = await slidingWindow.epoch(latestBlock - blocksInWindow);
      const toEpoch = await slidingWindow.epoch(latestBlock);
      expect(from).to.equal(fromEpoch);
      expect(to).to.equal(toEpoch);
    });
  });
};
