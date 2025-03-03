// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {hardhat_reset, hardhat_latestBlock, hardhat_latest} from "../../../../utils.test";
import {deployERC7858EpochSelector} from "./deployer.test";
import {ERC721, constants} from "../../../../constant.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Mint", async function () {
    const tokenId = 1;
    const expectBalance = 1;
    const expectBalanceMulti = 10;
    let startTime = 0;
    let endTime = 0;

    afterEach(async function () {
      await hardhat_reset();
      /** ensure safety reset starTime and endTime to zero */
      startTime = 0;
      endTime = 0;
    });

    it("[SUCCESS] mint expirable token", async function () {
      const {erc7858Epoch, alice} = await deployERC7858EpochSelector({epochType});
      const validityDuration = Number(await erc7858Epoch.validityDuration());
      const epochLength = Number(await erc7858Epoch.epochLength());
      await expect(erc7858Epoch.mint(alice.address, tokenId))
        .to.emit(erc7858Epoch, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      expect(await erc7858Epoch.balanceOf(alice.address)).to.equal(expectBalance);
      expect(await erc7858Epoch.unexpiredBalanceOf(alice.address)).to.equal(expectBalance);
      if (epochType == constants.EPOCH_TYPE.BLOCKS_BASED) {
        startTime = await hardhat_latestBlock();
      } else {
        startTime = await hardhat_latest();
      }
      endTime = startTime + validityDuration * epochLength;
      expect(await erc7858Epoch.startTime(tokenId)).to.equal(startTime);
      expect(await erc7858Epoch.endTime(tokenId)).to.equal(endTime);
      expect(await erc7858Epoch.isTokenExpired(tokenId)).to.equal(false);
    });

    it("[SUCCESS] mint multiple expirable token", async function () {
      const {erc7858Epoch, alice} = await deployERC7858EpochSelector({epochType});
      for (let index = tokenId; index <= 10; index++) {
        await expect(erc7858Epoch.mint(alice.address, index))
          .to.emit(erc7858Epoch, ERC721.events.Transfer)
          .withArgs(constants.ZERO_ADDRESS, alice.address, index);
      }
      expect(await erc7858Epoch.balanceOf(alice.address)).to.equal(expectBalanceMulti);
      expect(await erc7858Epoch.unexpiredBalanceOf(alice.address)).to.equal(expectBalanceMulti);
    });
  });
};
