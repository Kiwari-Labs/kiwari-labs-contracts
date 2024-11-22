import {expect} from "chai";
import {deployERC7818Whitelist} from "./utils.test";
import {common, ERC7818Whitelist, ERC20} from "../../../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint spendable to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(1);
      expect(await erc7818expWhitelist.safeBalanceOf(alice.address)).equal(1);
    });

    it("[HAPPY] correct mint un-spendable to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(1);
      expect(await erc7818expWhitelist.safeBalanceOf(alice.address)).equal(0);
    });

    it("[UNHAPPY] cannot mint to spendable to non whitelist address", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();

      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
      expect(await erc7818expWhitelist.whitelist(alice.address)).equal(false);
    });

    it("[UNHAPPY] cannot mint to un-spendable to non whitelist address", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();

      await expect(erc7818expWhitelist.mintUnspendableWhitelist(alice.address, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
      expect(await erc7818expWhitelist.whitelist(alice.address)).equal(false);
    });
  });
};
