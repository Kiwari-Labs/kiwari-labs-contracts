// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC7818FrozenSelector} from "./deployer.test";
import {constants, ERC7818Frozen} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Transfer", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transfer `to` non-frozen", async function () {
      const {erc7818Frozen, alice, bob} = await deployERC7818FrozenSelector({epochType});
      await erc7818Frozen.mint(alice.address, 100);
      expect(await erc7818Frozen.isFrozen(alice.address)).to.equal(false);
      expect(await erc7818Frozen.isFrozen(bob.address)).to.equal(false);
      await erc7818Frozen.connect(alice).transfer(bob.address, 100);
      expect(await erc7818Frozen.balanceOf(bob.address)).to.equal(100);
    });

    it("[SUCCESS] transfer `from` non-frozen", async function () {
      const {erc7818Frozen, alice, bob} = await deployERC7818FrozenSelector({epochType});
      await erc7818Frozen.mint(alice.address, 100);
      await erc7818Frozen.connect(alice).approve(bob.address, 100);
      expect(await erc7818Frozen.isFrozen(alice.address)).to.equal(false);
      expect(await erc7818Frozen.isFrozen(bob.address)).to.equal(false);
      await erc7818Frozen.connect(bob).transferFrom(alice.address, bob.address, 100);
      expect(await erc7818Frozen.balanceOf(bob.address)).to.equal(100);
    });

    it("[FAILED] transfer `to` frozen", async function () {
      const {erc7818Frozen, alice, bob} = await deployERC7818FrozenSelector({epochType});
      await erc7818Frozen.mint(alice.address, 100);
      await erc7818Frozen.freeze(bob.address);
      expect(await erc7818Frozen.isFrozen(alice.address)).to.equal(false);
      expect(await erc7818Frozen.isFrozen(bob.address)).to.equal(true);
      await erc7818Frozen.connect(alice).transfer(bob.address, 100);
      expect(await erc7818Frozen.balanceOf(bob.address)).to.equal(100);
    });

    it("[FAILED] transfer `from` frozen", async function () {
      const {erc7818Frozen, alice, bob} = await deployERC7818FrozenSelector({epochType});
      await erc7818Frozen.mint(alice.address, 100);
      await erc7818Frozen.connect(alice).approve(bob.address, 100);
      await erc7818Frozen.freeze(alice.address);
      expect(await erc7818Frozen.isFrozen(alice.address)).to.equal(true);
      expect(await erc7818Frozen.isFrozen(bob.address)).to.equal(false);
      await expect(erc7818Frozen.connect(bob).transferFrom(alice.address, bob.address, 100))
        .to.revertedWithCustomError(erc7818Frozen, ERC7818Frozen.errors.AccountFrozen)
        .withArgs(alice.address);
    });
  });
};
