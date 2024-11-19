import {expect} from "chai";
import {deployERC7818Whitelist} from "./utils.test";
import {common, ERC7818Whitelist, ERC20} from "../../../../constant.test";

export const run = async () => {
  describe("Transfer", async function () {
    it("[HAPPY] correct non whitelist transfer ", async function () {
      const {erc7818expWhitelist, deployer, alice, bob, jame} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const jameAddress = await jame.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, 1);
      expect(await erc7818expWhitelist.balanceOf(aliceAddress)).equal(1);
      await expect(erc7818expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(aliceAddress, common.zeroAddress, 1)
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bobAddress, 1);
      expect(await erc7818expWhitelist.balanceOf(aliceAddress)).equal(0);
      expect(await erc7818expWhitelist.balanceOf(bobAddress)).equal(1);
      await expect(erc7818expWhitelist.connect(bob).transfer(jameAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(bobAddress, jameAddress, 1);
      expect(await erc7818expWhitelist.balanceOf(bobAddress)).equal(0);
      expect(await erc7818expWhitelist.balanceOf(jameAddress)).equal(1);
    });

    // In cases of Wholesale and Retail are still in the designing phase to be discussed later.
    it("[HAPPY] whitelist address transfer spendable balance to non whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, 1);
      await expect(erc7818expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(aliceAddress, common.zeroAddress, 1)
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bobAddress, 1);
      expect(await erc7818expWhitelist.balanceOf(aliceAddress)).equal(0);
      expect(await erc7818expWhitelist.balanceOf(bobAddress)).equal(1);
      expect(await erc7818expWhitelist.safeBalanceOf(bobAddress)).equal(0);
    });

    it("[HAPPY] non whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, 1);
      await expect(erc7818expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(aliceAddress, common.zeroAddress, 1)
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bobAddress, 1);
      await expect(erc7818expWhitelist.connect(bob).transfer(aliceAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(bobAddress, common.zeroAddress, 1)
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, 1);
      expect(await erc7818expWhitelist.balanceOf(aliceAddress)).equal(1);
      expect(await erc7818expWhitelist.balanceOf(bobAddress)).equal(0);
      expect(await erc7818expWhitelist.safeBalanceOf(bobAddress)).equal(0);
    });

    it("[HAPPY] whitelist address transfer spendable balance to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.grantWhitelist(bobAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, 1);
      await expect(erc7818expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(aliceAddress, bobAddress, 1);
      expect(await erc7818expWhitelist.balanceOf(aliceAddress)).equal(0);
      expect(await erc7818expWhitelist.balanceOf(bobAddress)).equal(1);
      expect(await erc7818expWhitelist.safeBalanceOf(bobAddress)).equal(1);
    });

    it("[HAPPY] whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.grantWhitelist(bobAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, 1);
      await expect(erc7818expWhitelist.connect(alice).transferUnspendable(bobAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(aliceAddress, bobAddress, 1);
      expect(await erc7818expWhitelist.balanceOf(aliceAddress)).equal(0);
      expect(await erc7818expWhitelist.balanceOf(bobAddress)).equal(1);
      expect(await erc7818expWhitelist.safeBalanceOf(bobAddress)).equal(0);
    });

    it("[UNHAPPY] whitelist address insufficient transfer un-spendable balance to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.grantWhitelist(bobAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc7818expWhitelist.connect(alice).transferUnspendable(bobAddress, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC20.errors.ERC20InsufficientBalance,
      );
    });

    it("[UNHAPPY] whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.grantWhitelist(bobAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, 1);
      await expect(erc7818expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.revertedWithCustomError(erc7818expWhitelist, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(aliceAddress, 0, 1);
    });

    it("[UNHAPPY] whitelist address transfer un-spendable balance to non whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, 1);
      await expect(erc7818expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.revertedWithCustomError(erc7818expWhitelist, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(aliceAddress, 0, 1);
    });
  });
};
