import { expect } from "chai";
import { ethers } from "hardhat";
import { deployERC20EXP } from "../utils.test";
import { ZERO_ADDRESS } from "../constant.test";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
// import { ERC20_EXP_NAME, ERC20_EXP_SYMBOL } from "../constant.test";

export const run = async () => {
  describe("Transfer", async function () {
    it("[HAPPY] correct transfer", async function () {
      // TODO: add test case (suitable logic and event response).
      const { erc20exp, alice ,bob} = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const balanceAliceBefore = await erc20exp["balanceOf(address)"](aliceAddress);
      await expect(await erc20exp._mintRetail(aliceAddress, 100n))
        .to.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 100n);
      const balanceAliceAfter = await erc20exp["balanceOf(address)"](aliceAddress);
      expect(balanceAliceBefore).to.equal(0);
      expect(balanceAliceAfter).to.equal(100n);
      for (let index = 100; index > 0; index--) {
        await erc20exp.connect(alice).transfer(bobAddress, 1n);
      }
      const balanceBob = await erc20exp["balanceOf(address)"](bobAddress);
      console.log("balanceBob", balanceBob);
      expect(balanceBob).to.equal(100);
    });

    it("[UNHAPPY] should not be transfer to zero address", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] insufficient balance", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] should not transferable the token that expired", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    // In cases of Wholesale and Retail are still in the designing phase to be discussed later.
  });
};
