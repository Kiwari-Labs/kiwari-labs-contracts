// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC7818FrozenSelector} from "./deployer.test";
import {constants, ERC7818Frozen} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Unfreeze", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] removeFromFrozen", async function () {
      const {erc7818Frozen, deployer, alice} = await deployERC7818FrozenSelector({epochType});
      await erc7818Frozen.freeze(alice.address);
      await expect(erc7818Frozen.unfreeze(alice.address))
        .to.emit(erc7818Frozen, ERC7818Frozen.events.Unfreeze)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818Frozen.isFrozen(alice.address)).to.equal(false);
    });

    it("[FAILED] account not frozen", async function () {
      const {erc7818Frozen, alice} = await deployERC7818FrozenSelector({epochType});
      await expect(erc7818Frozen.unfreeze(alice.address)).to.be.revertedWithCustomError(
        erc7818Frozen,
        ERC7818Frozen.errors.AccountNotFrozen,
      );
    });
  });
};
