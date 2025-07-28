// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {constants, ERC721} from "../../../../constant.test";
import {hardhat_increasePointerTo, hardhat_reset} from "../../../../utils.test";
import {deployERC7858EpochSelector} from "./deployer.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  const tokenId = 1;

  describe("Interface", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    // Interface ERC-721 and ERC-721Metadata
    it("[SUCCESS] ERC-721 and ERC-721Metadata", async function () {
      const {erc7858Epoch, alice} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.name()).to.equal(ERC721.constructor.name);
      expect(await erc7858Epoch.symbol()).to.equal(ERC721.constructor.symbol);
      expect(await erc7858Epoch.balanceOf(alice.address)).to.equal(0);
      await expect(erc7858Epoch.balanceOf(constants.ZERO_ADDRESS))
        .to.revertedWithCustomError(erc7858Epoch, ERC721.errors.ERC721InvalidOwner)
        .withArgs(constants.ZERO_ADDRESS);
      await expect(erc7858Epoch.mint(alice.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      expect(await erc7858Epoch.tokenURI(tokenId)).to.equal("");
    });

    it("[SUCCESS] expiryType", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.expiryType()).to.equal(epochType);
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

    it("[SUCCESS] unexpiredBalanceOfAtEpoch", async function () {
      const {erc7858Epoch, alice} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.unexpiredBalanceOfAtEpoch(0, alice.address)).to.equal(0);
    });

    it("[SUCCESS] unexpiredBalanceOf", async function () {
      const {erc7858Epoch, alice} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.unexpiredBalanceOf(alice.address)).to.equal(0);
    });

    it("[SUCCESS] unexpiredBalanceOf zeroAddress", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      await expect(erc7858Epoch.unexpiredBalanceOf(constants.ZERO_ADDRESS))
        .to.revertedWithCustomError(erc7858Epoch, ERC721.errors.ERC721InvalidOwner)
        .withArgs(constants.ZERO_ADDRESS);
    });

    it("[SUCCESS] supportsInterface ERC-165", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.supportsInterface("0x01ffc9a7")).to.equal(true);
    });

    it("[SUCCESS] supportsInterface ERC-721", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.supportsInterface("0x80ac58cd")).to.equal(true);
    });

    it("[SUCCESS] supportsInterface ERC-721Metadata", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.supportsInterface("0x5b5e139f")).to.equal(true);
    });

    it("[SUCCESS] supportsInterface ERC-7858", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.supportsInterface("0x3ebdfa31")).to.equal(true);
    });

    it("[SUCCESS] supportsInterface ERC-7858Epoch", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.supportsInterface("0x8f55b98a")).to.equal(true);
    });

    it("[FAILED] unexpiredBalanceOfAtEpoch expiredEpoch", async function () {
      const {erc7858Epoch, alice} = await deployERC7858EpochSelector({epochType});
      const epochLength = await erc7858Epoch.epochLength();
      const duration = await erc7858Epoch.validityDuration();
      await hardhat_increasePointerTo(epochType, epochLength * duration);
      await hardhat_increasePointerTo(epochType, epochLength + 1n);
      expect(await erc7858Epoch.unexpiredBalanceOfAtEpoch(0, alice.address)).to.equal(0);
    });

    it("[FAILED] supportsInterface unknown", async function () {
      const {erc7858Epoch} = await deployERC7858EpochSelector({epochType});
      expect(await erc7858Epoch.supportsInterface("0xffffffff")).to.equal(false);
    });
  });
};
