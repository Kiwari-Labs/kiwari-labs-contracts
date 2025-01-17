// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployBLSW} from "./deployer.test";
import {hardhat_mine, hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("Epoch", async function () {
    beforeEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] epoch", async function () {
      const {slidingWindow} = await deployBLSW({startBlockNumber: 1});
      const blocks = Number(await slidingWindow.blocksInEpoch());
      await hardhat_mine(blocks);
      expect(await slidingWindow.epoch(blocks + 1)).to.equal(1);
    });
  });
};
