// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployBLSW} from "./deployer.test";
import {hardhat_latestBlock, hardhat_mine, hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("WindowRange", async function () {
    beforeEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] windowRange from current block number", async function () {
      const {slidingWindow} = await deployBLSW({startBlockNumber: 1});
      const blocks = await slidingWindow.blocksInEpoch();
      await hardhat_mine(blocks);
      const [from, to] = await slidingWindow.windowRange(Number(blocks) + 1);
      expect(from).to.equal(0);
      expect(to).to.equal(1);
    });

    it("[SUCCESS] windowRange after `n` blocks", async function () {
      const {slidingWindow} = await deployBLSW({});
      const epochs = Number(await slidingWindow.windowSize());
      const blocks = Number(await slidingWindow.blocksInEpoch()) * epochs;
      await hardhat_mine(blocks);
      const latestBlock = Number(await hardhat_latestBlock());
      const blocksInWindow = Number(await slidingWindow.blocksInWindow());
      const [from, to] = await slidingWindow.windowRange(latestBlock);
      const fromEpoch = await slidingWindow.epoch(latestBlock - blocksInWindow);
      const toEpoch = await slidingWindow.epoch(latestBlock);
      expect(from).to.equal(fromEpoch);
      expect(to).to.equal(toEpoch);
    });
  });
};
