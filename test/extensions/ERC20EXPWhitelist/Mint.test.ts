import { expect } from "chai";
import { deployERC20EXPWhitelist } from "../../utils.test";
import {
  ERC20_INSUFFICIENT_BALANCE,
  ERC20_INVALID_RECEIVER,
  ERC20_INVALID_SENDER,
  INVALID_WHITELIST_ADDRESS,
  EVENT_TRANSFER,
  ZERO_ADDRESS,
  EVENT_WHITELIST_GRANTED,
} from "../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint spendable to whitelist address", async function () {
      const { erc20exp, deployer, alice } = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      expect(await erc20exp.whitelist(aliceAddress)).equal(true);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(1);
      expect(await erc20exp.safeBalanceOf(aliceAddress)).equal(1);
    });

    it("[HAPPY] correct mint un-spendable to whitelist address", async function () {
      const { erc20exp, deployer, alice } = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      expect(await erc20exp.whitelist(aliceAddress)).equal(true);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(1);
      expect(await erc20exp.safeBalanceOf(aliceAddress)).equal(0);
    });

    it("[UNHAPPY] cannot mint to spendable to non whitelist address", async function () {
      const { erc20exp, alice } = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.mintSpendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc20exp,
        INVALID_WHITELIST_ADDRESS,
      );
      expect(await erc20exp.whitelist(aliceAddress)).equal(false);
    });

    it("[UNHAPPY] cannot mint to un-spendable to non whitelist address", async function () {
      const { erc20exp, alice } = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.mintUnspendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc20exp,
        INVALID_WHITELIST_ADDRESS,
      );
      expect(await erc20exp.whitelist(aliceAddress)).equal(false);
    });
  });
};
