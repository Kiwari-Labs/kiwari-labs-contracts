// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {constants, ERC721} from "../../../constant.test";
import {hardhat_reset} from "../../../utils.test";
import {deployERC721Selector} from "./deployer.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  const tokenId = 1;

  describe("Interface", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] expiry type", async function () {
      const {erc721exp} = await deployERC721Selector({epochType});
      expect(await erc721exp.expiryType()).to.equal(epochType);
    });

    it("[SUCCESS] supportsInterface ERC-721", async function () {
      const {erc721exp} = await deployERC721Selector({epochType});
      expect(await erc721exp.supportsInterface("0x80ac58cd")).to.equal(true);
    });


    it("[SUCCESS] supportsInterface ERC-7858", async function () {
      const {erc721exp} = await deployERC721Selector({epochType});
      expect(await erc721exp.supportsInterface("0x3ebdfa31")).to.equal(true);
    });

    it("[SUCCESS] return startTime existence token", async function () {
      const {erc721exp, alice} = await deployERC721Selector({epochType});
      await expect(erc721exp.mint(alice.address, tokenId))
        .to.emit(erc721exp, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      expect(await erc721exp.startTime(tokenId)).to.equal(0);
    });

    it("[SUCCESS] return endTime existence token", async function () {
      const {erc721exp, alice} = await deployERC721Selector({epochType});
      await expect(erc721exp.mint(alice.address, tokenId))
        .to.emit(erc721exp, ERC721.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, tokenId);
      expect(await erc721exp.startTime(tokenId)).to.equal(0);
    });

    it("[FAILED] supportsInterface ERC-7858Epoch", async function () {
      const {erc721exp} = await deployERC721Selector({epochType});
      expect(await erc721exp.supportsInterface("0xaaf87b24")).to.equal(false);
    });

    it("[FAILED] supportsInterface unknown", async function () {
      const {erc721exp} = await deployERC721Selector({epochType});
      expect(await erc721exp.supportsInterface("0xffffffff")).to.equal(false);
    });

    it("[FAILED] return startTime nonexistence token", async function () {
      const {erc721exp} = await deployERC721Selector({epochType});
      await expect(erc721exp.startTime(tokenId)).to.be.revertedWithCustomError(erc721exp, ERC721.errors.ERC721NonexistentToken);
    });

    it("[FAILED] return endTime nonexistence token", async function () {
      const {erc721exp} = await deployERC721Selector({epochType});
      await expect(erc721exp.endTime(tokenId)).to.be.revertedWithCustomError(erc721exp, ERC721.errors.ERC721NonexistentToken);
    });

    it("[FAILED] update timestamp nonexistence token", async function () {
      const {erc721exp} = await deployERC721Selector({epochType});
      await expect(erc721exp.updateTimeStamp(tokenId, 0, 0)).to.be.revertedWithCustomError(erc721exp, ERC721.errors.ERC721NonexistentToken);
    });

    it("[FAILED] clear timestamp nonexistence token", async function () {
      const {erc721exp} = await deployERC721Selector({epochType});
      await expect(erc721exp.clearTimeStamp(tokenId)).to.be.revertedWithCustomError(erc721exp, ERC721.errors.ERC721NonexistentToken);
    });
  });
};
