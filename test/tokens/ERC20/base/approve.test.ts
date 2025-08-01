// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {ERC20, constants} from "../../../constant.test";
import {deployERC20Selector} from "./deployer.test";
import {hardhat_impersonate, hardhat_reset, hardhat_setBalance, hardhat_stopImpersonating, ethers} from "../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Approval", async function () {
    const amount = 100;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] approve", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      await erc20exp.mint(alice.address, amount);
      await expect(erc20exp.connect(alice).approve(bob.address, amount))
        .to.emit(erc20exp, ERC20.events.Approval)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc20exp.allowance(alice.address, bob.address)).to.equal(amount);
    });

    it("[SUCCESS] approve with maximum allowance", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      await erc20exp.mint(alice.address, amount);
      await expect(erc20exp.connect(alice).approve(bob.address, constants.MAX_UINT256))
        .to.emit(erc20exp, ERC20.events.Approval)
        .withArgs(alice.address, bob.address, constants.MAX_UINT256);
      expect(await erc20exp.allowance(alice.address, bob.address)).to.equal(constants.MAX_UINT256);
    });

    it("[FAILED] approve with invalid spender", async function () {
      const {erc20exp, alice} = await deployERC20Selector({epochType});
      await erc20exp.mint(alice.address, amount);
      await expect(erc20exp.connect(alice).approve(constants.ZERO_ADDRESS, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidSpender)
        .withArgs(constants.ZERO_ADDRESS);
    });

    it("[FAILED] arppove with invalid approver", async function () {
      const {erc20exp, alice} = await deployERC20Selector({epochType});
      await hardhat_setBalance(constants.ZERO_ADDRESS, ethers.parseEther("10000.0").toString());
      await hardhat_impersonate(constants.ZERO_ADDRESS);
      const signer = await ethers.getImpersonatedSigner(constants.ZERO_ADDRESS);
      await expect(erc20exp.connect(signer).approve(alice.address, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidApprover)
        .withArgs(constants.ZERO_ADDRESS);
      await hardhat_stopImpersonating(constants.ZERO_ADDRESS);
    });
  });
};
