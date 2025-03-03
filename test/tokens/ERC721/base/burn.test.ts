// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {hardhat_latest, hardhat_latestBlock, hardhat_reset} from "../../../utils.test";
import {deployERC7858Selector} from "./deployer.test";
import {constants, ERC721} from "../../../constant.test";
import {ZeroAddress} from "ethers";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Burn", async function () {
    const tokenId = 1;
    let startTime = 0;
    let endTime = 0;

    afterEach(async function () {
      await hardhat_reset();
      /**  */
      startTime = 0;
      endTime = 0;
    });

    it("[SUCCESS] burn expirable token", async function () {
      const {erc721exp, alice} = await deployERC7858Selector({epochType});
      await expect(erc721exp.mint(alice.address, tokenId))
        .to.emit(erc721exp, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      expect(await erc721exp.balanceOf(alice.address)).to.equal(1);
      expect(await erc721exp.startTime(tokenId)).to.equal(startTime);
      expect(await erc721exp.endTime(tokenId)).to.equal(endTime);
      await expect(erc721exp.burn(tokenId)).to.emit(erc721exp, ERC721.events.Transfer).withArgs(alice, ZeroAddress, tokenId);
      await expect(erc721exp.isTokenExpired(tokenId)).to.be.revertedWithCustomError(erc721exp, ERC721.errors.ERC721NonexistentToken);
    });

    it("[SUCCESS] burn unexpirable token", async function () {
      const {erc721exp, alice} = await deployERC7858Selector({epochType});
      await expect(erc721exp.mint(alice.address, tokenId))
        .to.emit(erc721exp, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      expect(await erc721exp.balanceOf(alice.address)).to.equal(1);
      expect(await erc721exp.startTime(tokenId)).to.equal(startTime);
      expect(await erc721exp.endTime(tokenId)).to.equal(endTime);
      await expect(erc721exp.burn(tokenId)).to.emit(erc721exp, ERC721.events.Transfer).withArgs(alice, ZeroAddress, tokenId);
      await expect(erc721exp.isTokenExpired(tokenId)).to.be.revertedWithCustomError(erc721exp, ERC721.errors.ERC721NonexistentToken);
    });

    it("[SUCCESS] burn and re-mint token that has timestamp", async function () {
      const {erc721exp, alice} = await deployERC7858Selector({epochType});
      await expect(erc721exp.mint(alice.address, tokenId))
        .to.emit(erc721exp, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      expect(await erc721exp.balanceOf(alice.address)).to.equal(1);
      if (epochType == constants.EPOCH_TYPE.BLOCKS_BASED) {
        startTime = await hardhat_latestBlock();
      } else {
        startTime = await hardhat_latest();
      }
      endTime = startTime + 1000;
      await erc721exp.updateTimeStamp(tokenId, startTime, endTime);
      expect(await erc721exp.startTime(tokenId)).to.equal(startTime);
      expect(await erc721exp.endTime(tokenId)).to.equal(endTime);
      await expect(erc721exp.burn(tokenId)).to.emit(erc721exp, ERC721.events.Transfer).withArgs(alice, ZeroAddress, tokenId);
      await expect(erc721exp.isTokenExpired(tokenId)).to.be.revertedWithCustomError(erc721exp, ERC721.errors.ERC721NonexistentToken);
      await expect(erc721exp.mint(alice.address, tokenId))
        .to.emit(erc721exp, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      expect(await erc721exp.balanceOf(alice.address)).to.equal(1);
      expect(await erc721exp.startTime(tokenId)).to.equal(0);
      expect(await erc721exp.endTime(tokenId)).to.equal(0);
    });
  });
};
