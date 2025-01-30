// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {hardhat_reset, hardhat_latestPointer} from "../../../utils.test";
import {deployERC20Selector} from "./deployer.test";
import {ERC20, constants} from "../../../constant.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Mint", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mint", async function () {
      const {erc20exp, alice} = await deployERC20Selector({epochType});
      await expect(erc20exp.mint(alice.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);

      const epoch = await erc20exp.currentEpoch();
      const latestPointer = await hardhat_latestPointer(epochType);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(amount);
      expect(await erc20exp.getWorldStateBalance(latestPointer));
      const list = await erc20exp.tokenList(alice.address, epoch);
      expect(list.length).to.equal(1);
      expect(list[0]).to.equal(latestPointer);
    });

    it("[FAILED] mint to zero address", async function () {
      const {erc20exp} = await deployERC20Selector({epochType});
      await expect(erc20exp.mint(constants.ZERO_ADDRESS, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidReceiver)
        .withArgs(constants.ZERO_ADDRESS);
    });
  });
};
