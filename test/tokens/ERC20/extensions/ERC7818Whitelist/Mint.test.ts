import {expect} from "chai";
import {deployERC7818Whitelist} from "./utils.test";
import {common, ERC7818Whitelist, ERC20} from "../../../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint spendable to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, 1);
      expect(await erc7818expWhitelist.balanceOf(aliceAddress)).equal(1);
      expect(await erc7818expWhitelist.safeBalanceOf(aliceAddress)).equal(1);
    });

    it("[HAPPY] correct mint un-spendable to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, 1);
      expect(await erc7818expWhitelist.balanceOf(aliceAddress)).equal(1);
      expect(await erc7818expWhitelist.safeBalanceOf(aliceAddress)).equal(0);
    });

    it("[UNHAPPY] cannot mint to spendable to non whitelist address", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc7818expWhitelist.mintSpendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
      expect(await erc7818expWhitelist.whitelist(aliceAddress)).equal(false);
    });

    it("[UNHAPPY] cannot mint to un-spendable to non whitelist address", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
      expect(await erc7818expWhitelist.whitelist(aliceAddress)).equal(false);
    });
  });
};
