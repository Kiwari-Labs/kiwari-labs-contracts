import {expect} from "chai";
import {deployERC7818Whitelist} from "./utils.test";
import {common, ERC7818Whitelist, ERC20} from "../../../../constant.test";

export const run = async () => {
  describe("Transfer", async function () {
    it("[HAPPY] correct non whitelist transfer ", async function () {
      const {erc7818expWhitelist, deployer, alice, bob, jame} = await deployERC7818Whitelist();

      const jameAddress = await jame.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(1);
      await expect(erc7818expWhitelist.connect(alice)["transfer(address,uint256)"](bob.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, common.zeroAddress, 1)
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc7818expWhitelist["balanceOf(address)"](bob.address)).equal(1);
      await expect(erc7818expWhitelist.connect(bob)["transfer(address,uint256)"](jameAddress, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(bob.address, jameAddress, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](bob.address)).equal(0);
      expect(await erc7818expWhitelist["balanceOf(address)"](jameAddress)).equal(1);
    });

    // In cases of Wholesale and Retail are still in the designing phase to be discussed later.
    it("[HAPPY] whitelist address transfer spendable balance to non whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      await expect(erc7818expWhitelist.connect(alice)["transfer(address,uint256)"](bob.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, common.zeroAddress, 1)
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc7818expWhitelist["balanceOf(address)"](bob.address)).equal(1);
      expect(await erc7818expWhitelist.safeBalanceOf(bob.address)).equal(0);
    });

    it("[HAPPY] non whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      await expect(erc7818expWhitelist.connect(alice)["transfer(address,uint256)"](bob.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, common.zeroAddress, 1)
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, 1);
      await expect(erc7818expWhitelist.connect(bob)["transfer(address,uint256)"](alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(bob.address, common.zeroAddress, 1)
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(1);
      expect(await erc7818expWhitelist["balanceOf(address)"](bob.address)).equal(0);
      expect(await erc7818expWhitelist.safeBalanceOf(bob.address)).equal(0);
    });

    it("[HAPPY] whitelist address transfer spendable balance to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.grantWhitelist(bob.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, bob.address);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      await expect(erc7818expWhitelist.connect(alice)["transfer(address,uint256)"](bob.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc7818expWhitelist["balanceOf(address)"](bob.address)).equal(1);
      expect(await erc7818expWhitelist.safeBalanceOf(bob.address)).equal(1);
    });

    it("[HAPPY] whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.grantWhitelist(bob.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, bob.address);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      await expect(erc7818expWhitelist.connect(alice).transferUnspendable(bob.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 1);
      expect(await erc7818expWhitelist["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc7818expWhitelist["balanceOf(address)"](bob.address)).equal(1);
      expect(await erc7818expWhitelist.safeBalanceOf(bob.address)).equal(0);
    });

    it("[UNHAPPY] whitelist address insufficient transfer un-spendable balance to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.grantWhitelist(bob.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, bob.address);
      await expect(
        erc7818expWhitelist.connect(alice)["transfer(address,uint256)"](bob.address, 1),
      ).to.be.revertedWithCustomError(erc7818expWhitelist, ERC20.errors.ERC20InsufficientBalance);
    });

    it("[UNHAPPY] whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.grantWhitelist(bob.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, bob.address);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      await expect(erc7818expWhitelist.connect(alice)["transfer(address,uint256)"](bob.address, 1))
        .to.be.revertedWithCustomError(erc7818expWhitelist, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, 1);
    });

    it("[UNHAPPY] whitelist address transfer un-spendable balance to non whitelist address", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();

      const deployerAddress = await deployer.getAddress();
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(alice.address, 1))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, 1);
      await expect(erc7818expWhitelist.connect(alice)["transfer(address,uint256)"](bob.address, 1))
        .to.be.revertedWithCustomError(erc7818expWhitelist, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, 1);
    });
  });
};
