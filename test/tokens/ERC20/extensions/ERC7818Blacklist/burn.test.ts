// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC7818BlacklistSelector} from "./deployer.test";
import {constants, ERC7818Blacklist} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Burn", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] burn `from` non-blacklisted", async function () {
      const {erc7818Blacklist, alice} = await deployERC7818BlacklistSelector({epochType});
      await erc7818Blacklist.mint(alice.address, amount);
      expect(await erc7818Blacklist.isBlacklisted(alice.address)).to.equal(false);
      await erc7818Blacklist.burn(alice.address, amount);
      expect(await erc7818Blacklist.balanceOf(alice.address)).to.equal(0);
    });

    it("[FAILED] burn `from` blacklisted", async function () {
      const {erc7818Blacklist, alice} = await deployERC7818BlacklistSelector({epochType});
      await erc7818Blacklist.mint(alice.address, amount);
      await erc7818Blacklist.addToBlacklist(alice.address);
      expect(await erc7818Blacklist.isBlacklisted(alice.address)).to.equal(true);
      await expect(erc7818Blacklist.burn(alice.address, amount))
        .to.revertedWithCustomError(erc7818Blacklist, ERC7818Blacklist.errors.AccountBlacklisted)
        .withArgs(alice.address);
    });
  });
};
