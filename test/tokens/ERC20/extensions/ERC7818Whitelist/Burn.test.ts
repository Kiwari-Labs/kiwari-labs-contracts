import {expect} from "chai";
import {deployERC7818Whitelist} from "./utils.test";
import {common, ERC7818Whitelist, ERC20} from "../../../../constant.test";

export const run = async () => {
  describe("Burn", async function () {
    it("[HAPPY] correct burn spendable to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      await expect(erc7818expWhitelist.burnSpendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, common.zeroAddress, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[HAPPY] correct burn un-spendable to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      await expect(erc7818expWhitelist.burnUnspendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, common.zeroAddress, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[UNHAPPY] cannot burn cause insufficient balance of whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.burnUnspendableWhitelist(alice.address, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC20.errors.ERC20InsufficientBalance,
      );
    });

    it("[UNHAPPY] cannot burn to spendable to non whitelist address", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();

      await expect(erc7818expWhitelist.burnSpendableWhitelist(alice.address, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
    });

    it("[UNHAPPY] cannot burn to un-spendable to non whitelist address", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();

      await expect(erc7818expWhitelist.burnUnspendableWhitelist(alice.address, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
    });
  });
};
