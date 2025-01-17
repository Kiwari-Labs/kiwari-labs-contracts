// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC20Selector} from "../base/deployer.test";
import {ERC20, constants} from "../../../constant.test";
import {hardhat_increasePointerTo, hardhat_reset} from "../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Transfer", async function () {
    const amount = 2;
    const iterate = 10;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transfer during epoch nearest expiry", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      const epochLength = await erc20exp.epochLength();

      let epochs = 2;
      while (epochs != 0) {
        for (let i = 0; i < iterate; i++) {
          await erc20exp.mint(alice.address, amount);
        }
        await hardhat_increasePointerTo(epochType, Number(epochLength) - iterate - 1);
        epochs--;
      }

      let epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(1);

      await hardhat_increasePointerTo(epochType, 10);

      epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(2);

      const currentBalance = await erc20exp.balanceOf(alice.address);

      await expect(erc20exp.connect(alice).transfer(bob.address, currentBalance - 2n))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, currentBalance - 2n);
    });

    it("[SUCCESS] transfer multiple small token overlap epoch correctly", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      const epochLength = await erc20exp.epochLength();

      let epochs = 2;
      while (epochs != 0) {
        for (let i = 0; i < iterate; i++) {
          await erc20exp.mint(alice.address, amount);
        }
        await hardhat_increasePointerTo(epochType, Number(epochLength) - iterate - 1);
        epochs--;
      }

      const epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(1);

      expect(await erc20exp.balanceOfAtEpoch(0, alice.address)).to.equal(20);
      expect(await erc20exp.balanceOfAtEpoch(1, alice.address)).to.equal(20);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(40);

      await expect(erc20exp.connect(alice).transfer(bob.address, 25))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 25);

      expect(await erc20exp.balanceOfAtEpoch(0, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(1, alice.address)).to.equal(15);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(15);
      expect(await erc20exp.balanceOfAtEpoch(0, bob.address)).to.equal(20);
      expect(await erc20exp.balanceOfAtEpoch(1, bob.address)).to.equal(5);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(25);
    });
  });
};
