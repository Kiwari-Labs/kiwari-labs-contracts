// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC20Selector} from "./deployer.test";
import {ERC20, constants} from "../../../constant.test";
import {ethers, hardhat_impersonate, hardhat_reset, hardhat_setBalance, hardhat_stopImpersonating} from "../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Transfer", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transfer", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      const epoch = await erc20exp.currentEpoch();
      await erc20exp.mint(alice.address, amount);
      await expect(erc20exp.connect(alice).transfer(bob.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(amount);
    });

    it("[SUCCESS] transfer with zero amount", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      await expect(erc20exp.connect(alice).transfer(bob.address, 0))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 0);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
    });

    it("[FAILED] transfer with invalid sender", async function () {
      const {erc20exp, alice} = await deployERC20Selector({epochType});

      await hardhat_setBalance(constants.ZERO_ADDRESS, ethers.parseEther("10000.0").toString());
      await hardhat_impersonate(constants.ZERO_ADDRESS);
      const signer = await ethers.getImpersonatedSigner(constants.ZERO_ADDRESS);

      await expect(erc20exp.connect(signer).transfer(alice.address, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidSender)
        .withArgs(constants.ZERO_ADDRESS);

      await hardhat_stopImpersonating(constants.ZERO_ADDRESS);
    });

    it("[FAILED] transfer with invalid receiver", async function () {
      const {erc20exp, alice} = await deployERC20Selector({epochType});
      await expect(erc20exp.connect(alice).transfer(constants.ZERO_ADDRESS, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidReceiver)
        .withArgs(constants.ZERO_ADDRESS);
    });

    it("[FAILED] transfer with insufficient balance", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      await expect(erc20exp.connect(alice).transfer(bob.address, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, amount);
    });
  });
};
