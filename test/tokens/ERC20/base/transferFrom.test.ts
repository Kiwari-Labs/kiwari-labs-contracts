// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC20Selector} from "./deployer.test";
import {ERC20, constants} from "../../../constant.test";
import {hardhat_reset} from "../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("TransferFrom", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transferFrom", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      await erc20exp.mint(alice.address, amount);
      await erc20exp.connect(alice).approve(bob.address, amount);
      await expect(erc20exp.connect(bob).transferFrom(alice.address, bob.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      const epoch = await erc20exp.currentEpoch();
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(amount);
    });

    it("[SUCCESS] transferFrom with approve maximum", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      await erc20exp.mint(alice.address, amount);
      await erc20exp.connect(alice).approve(bob.address, constants.MAX_UINT256);
      await expect(erc20exp.connect(bob).transferFrom(alice.address, bob.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      const epoch = await erc20exp.currentEpoch();
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(amount);
    });

    it("[FAILED] transferFrom with insufficient allowance", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      await erc20exp.mint(alice.address, amount);
      await erc20exp.connect(alice).approve(bob.address, amount);
      await expect(erc20exp.connect(bob).transferFrom(alice.address, bob.address, amount + amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InsufficientAllowance)
        .withArgs(bob.address, amount, amount + amount);
      const epoch = await erc20exp.currentEpoch();
      expect(await erc20exp.balanceOf(alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(0);
    });
  });
};
