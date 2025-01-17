// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {constants, ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuotaSelector} from "./deployer.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("RemoveMinter", async function () {
    const quota = 100;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] removeMinter", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuotaSelector({epochType});

      await erc7818MintQuota.addMinter(alice.address, quota);
      await expect(erc7818MintQuota.removeMinter(alice.address))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.MinterRemoved)
        .withArgs(deployer.address, alice.address);
    });

    it("[FAILED] minter not set", async function () {
      const {erc7818MintQuota, alice} = await deployERC7818MintQuotaSelector({epochType});
      await expect(erc7818MintQuota.removeMinter(alice.address)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.MinterNotSet,
      );
    });
  });
};
