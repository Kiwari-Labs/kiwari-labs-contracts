// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC7818FrozenSelector} from "./deployer.test";
import {constants, ERC7818Frozen} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Mint", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mint `to` non-frozen", async function () {
      const {erc7818Frozen, alice} = await deployERC7818FrozenSelector({epochType});
      expect(await erc7818Frozen.isFrozen(alice.address)).to.equal(false);
      await erc7818Frozen.mint(alice.address, amount);
      expect(await erc7818Frozen.balanceOf(alice.address)).to.equal(amount);
    });

    it("[FAILED] mint `to` frozen", async function () {
      const {erc7818Frozen, alice} = await deployERC7818FrozenSelector({epochType});
      await erc7818Frozen.freeze(alice.address);
      expect(await erc7818Frozen.isFrozen(alice.address)).to.equal(true);
      await erc7818Frozen.mint(alice.address, amount);
      expect(await erc7818Frozen.balanceOf(alice.address)).to.equal(amount);
    });
  });
};
