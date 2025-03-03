// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {hardhat_reset, hardhat_latestBlock, hardhat_latest} from "../../../../utils.test";
import {deployERC7858EpochSelector} from "./deployer.test";
import {ERC721, constants} from "../../../../constant.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Approve", async function () {
    const tokenId = 1;
    const expectBalance = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] approve token", async function () {
      const {erc7858Epoch, alice, bob} = await deployERC7858EpochSelector({epochType});
      await expect(erc7858Epoch.mint(alice.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      await expect(erc7858Epoch.connect(alice).approve(bob.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Approval)
        .withArgs(alice.address, bob.address, tokenId);
      expect(await erc7858Epoch.getApproved(tokenId)).to.equal(bob.address);
    });

    it("[SUCCESS] approve token for all", async function () {
      const {erc7858Epoch, alice, bob} = await deployERC7858EpochSelector({epochType});
      await expect(erc7858Epoch.mint(alice.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      await expect(erc7858Epoch.connect(alice).setApprovalForAll(bob.address, true))
        .to.emit(erc7858Epoch, ERC721.events.ApprovalForAll)
        .withArgs(alice.address, bob.address, true);
      expect(await erc7858Epoch.isApprovedForAll(alice.address, bob.address)).to.equal(true);
    });

    it("[SUCCESS] approve and transferFrom", async function () {
      const {erc7858Epoch, alice, bob} = await deployERC7858EpochSelector({epochType});
      await expect(erc7858Epoch.mint(alice.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      await expect(erc7858Epoch.connect(alice).approve(bob.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Approval)
        .withArgs(alice.address, bob.address, tokenId);
      expect(await erc7858Epoch.getApproved(tokenId)).to.equal(bob.address);
      expect(await erc7858Epoch.balanceOf(alice.address)).to.equal(expectBalance);
      expect(await erc7858Epoch.unexpiredBalanceOf(alice.address)).to.equal(expectBalance);
      await expect(erc7858Epoch.connect(bob).transferFrom(alice.address, bob.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(alice.address, bob.address, tokenId);
      expect(await erc7858Epoch.balanceOf(alice.address)).to.equal(0);
      expect(await erc7858Epoch.unexpiredBalanceOf(alice.address)).to.equal(0);
      expect(await erc7858Epoch.isTokenExpired(tokenId)).to.equal(false);
      expect(await erc7858Epoch.balanceOf(bob.address)).to.equal(expectBalance);
      expect(await erc7858Epoch.unexpiredBalanceOf(bob.address)).to.equal(expectBalance);
      expect(await erc7858Epoch.ownerOf(tokenId)).to.equal(bob.address);
    });

    it("[FAILED] invalid approved", async function () {
      const {erc7858Epoch, alice, bob} = await deployERC7858EpochSelector({epochType});
      await expect(erc7858Epoch.mint(alice.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      await expect(erc7858Epoch.connect(bob).approve(alice.address, tokenId))
        .to.revertedWithCustomError(erc7858Epoch, ERC721.errors.ERC721InvalidApprover)
        .withArgs(bob.address);
    });

    it("[FAILED] approve nonexistence token", async function () {
      const {erc7858Epoch, alice, bob} = await deployERC7858EpochSelector({epochType});
      await expect(erc7858Epoch.connect(alice).approve(bob.address, tokenId))
        .to.revertedWithCustomError(erc7858Epoch, ERC721.errors.ERC721NonexistentToken)
        .withArgs(tokenId);
    });
  });
};
