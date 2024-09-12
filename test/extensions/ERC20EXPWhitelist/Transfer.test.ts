import { expect } from "chai";
import { deployERC20EXPWhitelist } from "../../utils.test";
import { ZERO_ADDRESS } from "../../constant.test";
import { parseEther } from "ethers/lib/utils";
import { reset, time, mineUpTo } from "@nomicfoundation/hardhat-network-helpers";

export const run = async () => {
  describe("Transfer", async function () {
    it("[HAPPY] correct bulk transfer across era", async function () {
      // TODO: add test case (suitable logic and event response).
    });
    it("[HAPPY] correct transferFrom", async function () {
      // TODO: add test case (suitable logic and event response).
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
    it("[HAPPY] whitelist address transfer spendable balance to non whitelist address", async function () {
      const { erc20exp, deployer, alice, bob } = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, "WhitelistGranted")
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(aliceAddress, ZERO_ADDRESS, 1)
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, bobAddress, 1);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
      expect(await erc20exp.balanceOf(bobAddress)).equal(1);
    });

    it("[HAPPY] whitelist address transfer spendable balance to whitelist address", async function () {
      const { erc20exp, deployer, alice, bob } = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, "WhitelistGranted")
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.grantWhitelist(bobAddress))
        .to.emit(erc20exp, "WhitelistGranted")
        .withArgs(deployerAddress, bobAddress);
      await expect(erc20exp.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(aliceAddress, bobAddress, 1);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
      expect(await erc20exp.balanceOf(bobAddress)).equal(1);
    });

    it("[UNHAPPY] whitelist address transfer un-spendable balance to whitelist address", async function () {
    });

    it("[UNHAPPY] whitelist address transfer un-spendable balance to non whitelist address", async function () {
    });
  });
};
