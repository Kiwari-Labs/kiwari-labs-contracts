import { expect } from "chai";
import { deployERC20EXPWhitelist } from "../../utils.test";
import { INVALID_WHITELIST_ADDRESS, EVENT_TRANSFER, ZERO_ADDRESS, EVENT_WHITELIST_GRANTED } from "../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint spendable to whitelist address", async function () {
      const { erc20expWhitelist, deployer, alice } = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      expect(await erc20expWhitelist.balanceOf(aliceAddress)).equal(1);
      expect(await erc20expWhitelist.safeBalanceOf(aliceAddress)).equal(1);
    });

    it("[HAPPY] correct mint un-spendable to whitelist address", async function () {
      const { erc20expWhitelist, deployer, alice } = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      expect(await erc20expWhitelist.balanceOf(aliceAddress)).equal(1);
      expect(await erc20expWhitelist.safeBalanceOf(aliceAddress)).equal(0);
    });

    it("[UNHAPPY] cannot mint to spendable to non whitelist address", async function () {
      const { erc20expWhitelist, alice } = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc20expWhitelist.mintSpendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc20expWhitelist,
        INVALID_WHITELIST_ADDRESS,
      );
      expect(await erc20expWhitelist.whitelist(aliceAddress)).equal(false);
    });

    it("[UNHAPPY] cannot mint to un-spendable to non whitelist address", async function () {
      const { erc20expWhitelist, alice } = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc20expWhitelist.mintUnspendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc20expWhitelist,
        INVALID_WHITELIST_ADDRESS,
      );
      expect(await erc20expWhitelist.whitelist(aliceAddress)).equal(false);
    });
  });
};
