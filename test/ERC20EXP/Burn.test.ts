import {expect} from "chai";
import {deployERC20EXP} from "../utils.test";
import {ZERO_ADDRESS} from "../constant.test";

export const run = async () => {
  describe("Burn", async function () {
    it("[HAPPY] correct burn", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] can burn only own token", async function () {
      // TODO: add test case (suitable logic and event response).
    });
  });

  describe("Burn From Wholesaler", async function () {
    it("[HAPPY] correct burn", async function () {
      const {erc20exp, alice} = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.grantWholeSale(aliceAddress))
        .to.emit(erc20exp, "GrantWholeSale")
        .withArgs(aliceAddress, true);
      await expect(erc20exp.mintSpentWholeSale(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.mintUnspentWholeSale(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.burnSpentWholeSale(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(aliceAddress, ZERO_ADDRESS, 1);
      await expect(erc20exp.burnUnspentWholeSale(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(aliceAddress, ZERO_ADDRESS, 1);
      expect(await erc20exp["balanceOf(address)"](aliceAddress)).to.equal(0);
    });

    it("[UNHAPPY] burn from non-wholesaler", async function () {
      const {erc20exp, alice} = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.burnSpentWholeSale(aliceAddress, 1)).to.be.revertedWith(
        "can't burn non-expirable token to non wholesale account",
      );
      await expect(erc20exp.burnUnspentWholeSale(aliceAddress, 1)).to.be.revertedWith(
        "can't burn non-expirable token to non wholesale account",
      );
    });

    it("[UNHAPPY] insufficient balance to burn", async function () {
      const {erc20exp, alice} = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.grantWholeSale(aliceAddress))
        .to.emit(erc20exp, "GrantWholeSale")
        .withArgs(aliceAddress, true);
      await expect(erc20exp.burnSpentWholeSale(aliceAddress, 1))
        .to.be.revertedWithCustomError(erc20exp, "ERC20InsufficientBalance")
        .withArgs(aliceAddress, 0, 1);
      await expect(erc20exp.burnUnspentWholeSale(aliceAddress, 1))
        .to.be.revertedWithCustomError(erc20exp, "ERC20InsufficientBalance")
        .withArgs(aliceAddress, 0, 1);
    });
  });

  describe("Burn From Retailer", async function () {
    it("[HAPPY] correct burn", async function () {
      const {erc20exp, alice} = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      const beforeBalance = await erc20exp["balanceOf(address)"](aliceAddress);
      await erc20exp.mintRetail(aliceAddress, 1);
      expect(beforeBalance).to.equal(0);
      expect(await erc20exp["balanceOf(address)"](aliceAddress)).to.equal(1);
      await expect(erc20exp.burnRetail(aliceAddress, 1))
        .to.emit(erc20exp, "Transfer")
        .withArgs(aliceAddress, ZERO_ADDRESS, 1);
      expect(await erc20exp["balanceOf(address)"](aliceAddress)).to.equal(0);
    });

    it("[UNHAPPY] burn from non-retailer", async function () {
      // TODO: add test case (suitable logic and event response).
      const {erc20exp, alice} = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      await erc20exp.grantWholeSale(aliceAddress);
      await expect(erc20exp.burnRetail(aliceAddress, 1)).to.be.revertedWith(
        "can't burn expirable token to non retail account",
      );
    });

    it("[UNHAPPY] insufficient balance to burn", async function () {
      // TODO: add test case (suitable logic and event response).
      const {erc20exp, alice} = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.burnRetail(aliceAddress, 1))
        .to.be.revertedWithCustomError(erc20exp, "ERC20InsufficientBalance")
        .withArgs(aliceAddress, 0, 1);
    });
  });
};
