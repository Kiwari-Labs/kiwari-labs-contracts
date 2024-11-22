import {expect} from "chai";
import {deployERC7818Whitelist} from "./utils.test";
import {ERC7818Whitelist} from "../../../../constant.test";

export const run = async () => {
  describe("Whitelist", async function () {
    it("[HAPPY] granted whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      expect(await erc7818expWhitelist.whitelist(alice.address)).equal(true);
    });

    it("[HAPPY] revoked whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.revokeWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistRevoked)
        .withArgs(deployerAddress, alice.address);
      expect(await erc7818expWhitelist.whitelist(alice.address)).equal(false);
    });

    it("[HAPPY] revoked can clean whitelist address balance", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await erc7818expWhitelist.mintSpendableWhitelist(alice.address, 1);
      await erc7818expWhitelist.mintUnspendableWhitelist(alice.address, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(2);
      expect(await erc7818expWhitelist.safeBalanceOf(alice.address)).equal(1);
      await expect(erc7818expWhitelist.revokeWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistRevoked)
        .withArgs(deployerAddress, alice.address);
      expect(await erc7818expWhitelist.whitelist(alice.address)).equal(false);
    });

    it("[UNHAPPY] granted exist whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.grantWhitelist(alice.address)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.ExistInWhitelist,
      );
    });

    it("[UNHAPPY] revoked non whitelist address", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();

      await expect(erc7818expWhitelist.revokeWhitelist(alice.address)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.NotExistInWhitelist,
      );
    });
  });
};
