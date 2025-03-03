// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {hardhat_reset, hardhat_latestBlock, hardhat_latest} from "../../../../utils.test";
import {deployERC7858EpochSelector} from "./deployer.test";
import {ERC721, constants} from "../../../../constant.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Burn", async function () {
    const tokenId = 1;
    const expectBalanceAfterMint = 1;
    const expectBalanceMultiAfterMint = 10;
    const expectBalanceAfterBurn = 0;
    let startTime = 0;
    let endTime = 0;

    afterEach(async function () {
      await hardhat_reset();
      /** ensure safety reset starTime and endTime to zero */
      startTime = 0;
      endTime = 0;
    });

    it("[SUCCESS] burn expirable token", async function () {
      const {erc7858Epoch, alice} = await deployERC7858EpochSelector({epochType});
      await expect(erc7858Epoch.mint(alice.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      expect(await erc7858Epoch.balanceOf(alice.address)).to.equal(expectBalanceAfterMint);
      expect(await erc7858Epoch.unexpiredBalanceOf(alice.address)).to.equal(expectBalanceAfterMint);
      await expect(erc7858Epoch.burn(tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, tokenId);
      expect(await erc7858Epoch.balanceOf(alice.address)).to.equal(expectBalanceAfterBurn);
      expect(await erc7858Epoch.unexpiredBalanceOf(alice.address)).to.equal(expectBalanceAfterBurn);
      await expect(erc7858Epoch.startTime(tokenId)).to.revertedWithCustomError(erc7858Epoch, ERC721.errors.ERC721NonexistentToken);
      await expect(erc7858Epoch.endTime(tokenId)).to.revertedWithCustomError(erc7858Epoch, ERC721.errors.ERC721NonexistentToken);
      await expect(erc7858Epoch.isTokenExpired(tokenId)).to.revertedWithCustomError(erc7858Epoch, ERC721.errors.ERC721NonexistentToken);
    });

    it("[SUCCESS] mint multiple expirable token", async function () {
      const {erc7858Epoch, alice} = await deployERC7858EpochSelector({epochType});
      for (let index = tokenId; index <= 10; index++) {
        await expect(erc7858Epoch.mint(alice.address, index))
          .to.emit(erc7858Epoch, ERC721.events.Transfer)
          .withArgs(constants.ZERO_ADDRESS, alice.address, index);
      }
      expect(await erc7858Epoch.balanceOf(alice.address)).to.equal(expectBalanceMultiAfterMint);
      expect(await erc7858Epoch.unexpiredBalanceOf(alice.address)).to.equal(expectBalanceMultiAfterMint);
      for (let index = tokenId; index <= 10; index++) {
        await expect(erc7858Epoch.burn(index))
          .to.emit(erc7858Epoch, ERC721.events.Transfer)
          .withArgs(alice.address, constants.ZERO_ADDRESS, index);
      }
      expect(await erc7858Epoch.balanceOf(alice.address)).to.equal(expectBalanceAfterBurn);
      expect(await erc7858Epoch.unexpiredBalanceOf(alice.address)).to.equal(expectBalanceAfterBurn);
    });
  });
};
