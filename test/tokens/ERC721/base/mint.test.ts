// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {hardhat_reset, hardhat_latestBlock, hardhat_latest} from "../../../utils.test";
import {deployERC721Selector} from "./deployer.test";
import {ERC721, ERC7858, constants} from "../../../constant.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Mint", async function () {
    const tokenId = 1;
    const expectBalance = 1;
    let startTime = 0;
    let endTime = 0;

    afterEach(async function () {
      await hardhat_reset();
      /** ensure safety reset starTime and endTime to zero */
      startTime = 0;
      endTime = 0;
    });

    it("[SUCCESS] mint unexpirable token", async function () {
      const {erc721exp, alice} = await deployERC721Selector({epochType});
      await expect(erc721exp.mint(alice.address, tokenId))
        .to.emit(erc721exp, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      expect(await erc721exp.balanceOf(alice.address)).to.equal(expectBalance);
      expect(await erc721exp.startTime(tokenId)).to.equal(startTime);
      expect(await erc721exp.endTime(tokenId)).to.equal(endTime);
      expect(await erc721exp.isTokenExpired(tokenId)).to.equal(false);
    });

    it("[SUCCESS] mint expirable token", async function () {
      const {erc721exp, alice} = await deployERC721Selector({epochType});
      await expect(erc721exp.mint(alice.address, tokenId))
        .to.emit(erc721exp, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);

      expect(await erc721exp.balanceOf(alice.address)).to.equal(expectBalance);
      if (epochType == constants.EPOCH_TYPE.BLOCKS_BASED) {
        startTime = await hardhat_latestBlock();
      } else {
        startTime = await hardhat_latest();
      }
      endTime = startTime + 1000;
      await erc721exp.updateTimeStamp(tokenId, startTime, endTime);
      expect(await erc721exp.startTime(tokenId)).to.equal(startTime);
      expect(await erc721exp.endTime(tokenId)).to.equal(endTime);
      expect(await erc721exp.isTokenExpired(tokenId)).to.equal(false);
    });

    it("[FAILED] mint expirable token with invalid timestamp", async function () {
      const {erc721exp, alice} = await deployERC721Selector({epochType});
      await expect(erc721exp.mint(alice.address, tokenId))
        .to.emit(erc721exp, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);

      expect(await erc721exp.balanceOf(alice.address)).to.equal(expectBalance);
      startTime = 1000;
      await expect(erc721exp.updateTimeStamp(tokenId, startTime, endTime))
        .to.be.revertedWithCustomError(erc721exp, ERC7858.errors.ERC7858InvalidTimeStamp)
        .withArgs(startTime, endTime);
    });
  });
};
