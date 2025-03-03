// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {constants} from "../../../../constant.test";
import {hardhat_increasePointerTo, hardhat_reset} from "../../../../utils.test";
import {deployERC7858EpochSelector} from "./deployer.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Interface", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] epochType", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.epochType()).to.equal(epochType);
    });

    it("[SUCCESS] validityDuration", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.validityDuration()).to.equal(constants.DEFAULT_WINDOW_SIZE);
    });

    it("[SUCCESS] currentEpoch", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.currentEpoch()).to.equal(0);
    });

    it("[SUCCESS] epochLength", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.currentEpoch()).to.equal(0);
    });

    it("[SUCCESS] isEpochExpired", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      const epochLength = await erc7858Epoch.epochLength();
      const duration = await erc7858Epoch.validityDuration();

      await hardhat_increasePointerTo(epochType, epochLength * duration);
      expect(await erc7858Epoch.isEpochExpired(0)).to.equal(false);

      await hardhat_increasePointerTo(epochType, epochLength + 1n);
      expect(await erc7858Epoch.isEpochExpired(0)).to.equal(true);
    });

    it("[SUCCESS] supportsInterface ERC-721", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.supportsInterface("0x80ac58cd")).to.equal(true);
    });

    it("[SUCCESS] supportsInterface ERC-7858", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.supportsInterface("0x3ebdfa31")).to.equal(true);
    });

    it("[SUCCESS] supportsInterface ERC-7858Epoch", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.supportsInterface("0xaaf87b24")).to.equal(true);
    });

    it("[FAILED] supportsInterface unknown", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.supportsInterface("0xffffffff")).to.equal(false);
    });
  });
};
