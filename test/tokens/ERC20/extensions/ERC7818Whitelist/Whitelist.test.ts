import {expect} from "chai";
import {deployERC7818Whitelist} from "./utils.test";
import {ERC7818Whitelist} from "../../../../constant.test";

export const run = async () => {
  describe("Whitelist", async function () {
    it("[HAPPY] granted whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      expect(await erc7818expWhitelist.whitelist(aliceAddress)).equal(true);
    });

    it("[HAPPY] revoked whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.revokeWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistRevoked)
        .withArgs(deployerAddress, aliceAddress);
      expect(await erc7818expWhitelist.whitelist(aliceAddress)).equal(false);
    });

    it("[HAPPY] revoked can clean whitelist address balance", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await erc7818expWhitelist.mintSpendableWhitelist(aliceAddress, 1);
      await erc7818expWhitelist.mintUnspendableWhitelist(aliceAddress, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](aliceAddress)).equal(2);
      expect(await erc7818expWhitelist.safeBalanceOf(aliceAddress)).equal(1);
      await expect(erc7818expWhitelist.revokeWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistRevoked)
        .withArgs(deployerAddress, aliceAddress);
      expect(await erc7818expWhitelist.whitelist(aliceAddress)).equal(false);
    });

    it("[UNHAPPY] granted exist whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.ExistInWhitelist,
      );
    });

    it("[UNHAPPY] revoked non whitelist address", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc7818expWhitelist.revokeWhitelist(aliceAddress)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.NotExistInWhitelist,
      );
    });
  });
};
