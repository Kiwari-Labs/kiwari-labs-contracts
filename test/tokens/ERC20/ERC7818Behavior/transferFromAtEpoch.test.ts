// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC20Selector} from "../base/deployer.test";
import {constants, ERC20, ERC7818} from "../../../constant.test";
import {hardhat_increasePointerTo, hardhat_reset} from "../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("TransferFromAtEpoch", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transferFromAtEpoch", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      const epoch = await erc20exp.currentEpoch();
      await erc20exp.mint(alice.address, amount);
      await erc20exp.connect(alice).approve(bob.address, amount);
      await expect(erc20exp.connect(bob).transferFromAtEpoch(epoch, alice.address, bob.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(amount);
    });

    it("[FAILED] transferFromAtEpoch with expired epoch", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      await erc20exp.mint(alice.address, amount);
      await erc20exp.connect(alice).approve(bob.address, amount);

      const epochLength = await erc20exp.epochLength();
      const duration = await erc20exp.validityDuration();

      await hardhat_increasePointerTo(epochType, epochLength * duration + epochLength);

      await expect(erc20exp.connect(bob).transferFromAtEpoch(0, alice.address, bob.address, amount)).to.be.revertedWithCustomError(
        erc20exp,
        ERC7818.errors.ERC7818TransferredExpiredToken,
      );

      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);

      expect(await erc20exp.balanceOfAtEpoch(0, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(0, bob.address)).to.equal(0);
    });
  });
};
