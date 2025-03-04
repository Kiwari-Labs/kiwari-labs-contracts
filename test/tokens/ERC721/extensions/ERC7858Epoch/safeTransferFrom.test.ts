// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {hardhat_reset} from "../../../../utils.test";
import {deployERC7858EpochSelector} from "./deployer.test";
import {ERC721, constants} from "../../../../constant.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("SafeTransferFrom", async function () {
    const tokenId = 1;
    const expectBalance = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] safeTransferFrom", async function () {
      const {erc7858Epoch, alice, bob} = await deployERC7858EpochSelector({epochType});
      await expect(erc7858Epoch.mint(alice.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      await expect(erc7858Epoch.connect(alice)["safeTransferFrom(address,address,uint256)"](alice.address, bob.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(alice.address, bob.address, tokenId);
      expect(await erc7858Epoch.balanceOf(alice.address)).to.equal(0);
      expect(await erc7858Epoch.unexpiredBalanceOf(alice.address)).to.equal(0);
      expect(await erc7858Epoch.isTokenExpired(tokenId)).to.equal(false);
      expect(await erc7858Epoch.balanceOf(bob.address)).to.equal(expectBalance);
      expect(await erc7858Epoch.unexpiredBalanceOf(bob.address)).to.equal(expectBalance);
      expect(await erc7858Epoch.ownerOf(tokenId)).to.equal(bob.address);
    });

    it("[FAILED] safeTransferFrom to zeroAddress", async function () {
      const {erc7858Epoch, alice, bob} = await deployERC7858EpochSelector({epochType});
      await expect(erc7858Epoch.mint(alice.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      await expect(erc7858Epoch.connect(alice)["safeTransferFrom(address,address,uint256)"](alice.address, constants.ZERO_ADDRESS, tokenId))
        .to.revertedWithCustomError(erc7858Epoch, ERC721.errors.ERC721InvalidReceiver)
        .withArgs(constants.ZERO_ADDRESS);
    });
  });
};
