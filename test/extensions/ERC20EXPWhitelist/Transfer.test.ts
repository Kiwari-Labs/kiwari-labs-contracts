import {expect} from "chai";
import {deployERC20EXPWhitelist} from "../../utils.test";
import {parseEther} from "ethers/lib/utils";
import {reset, time, mineUpTo} from "@nomicfoundation/hardhat-network-helpers";
import {erc20} from "../../../typechain-types/@openzeppelin/contracts/token";
import {
  ERROR_ERC20_INSUFFICIENT_BALANCE,
  ERROR_ERC20_INVALID_RECEIVER,
  ERROR_ERC20_INVALID_SENDER,
  EVENT_TRANSFER,
  EVENT_WHITELIST_GRANTED,
  ZERO_ADDRESS,
} from "../../constant.test";

export const run = async () => {
  describe(EVENT_TRANSFER, async function () {
    it("[HAPPY] correct non whitelist transfer ", async function () {
      const {erc20expWhitelist, deployer, alice, bob, jame} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const jameAddress = await jame.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      expect(await erc20expWhitelist.balanceOf(aliceAddress)).equal(1);
      await expect(erc20expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 1)
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, bobAddress, 1);
      expect(await erc20expWhitelist.balanceOf(aliceAddress)).equal(0);
      expect(await erc20expWhitelist.balanceOf(bobAddress)).equal(1);
      await expect(erc20expWhitelist.connect(bob).transfer(jameAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(bobAddress, jameAddress, 1);
      expect(await erc20expWhitelist.balanceOf(bobAddress)).equal(0);
      expect(await erc20expWhitelist.balanceOf(jameAddress)).equal(1);
    });

    // In cases of Wholesale and Retail are still in the designing phase to be discussed later.
    it("[HAPPY] whitelist address transfer spendable balance to non whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 1)
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, bobAddress, 1);
      expect(await erc20expWhitelist.balanceOf(aliceAddress)).equal(0);
      expect(await erc20expWhitelist.balanceOf(bobAddress)).equal(1);
      expect(await erc20expWhitelist.safeBalanceOf(bobAddress)).equal(0);
    });

    it("[HAPPY] non whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 1)
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, bobAddress, 1);
      await expect(erc20expWhitelist.connect(bob).transfer(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(bobAddress, ZERO_ADDRESS, 1)
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      expect(await erc20expWhitelist.balanceOf(aliceAddress)).equal(1);
      expect(await erc20expWhitelist.balanceOf(bobAddress)).equal(0);
      expect(await erc20expWhitelist.safeBalanceOf(bobAddress)).equal(0);
    });

    it("[HAPPY] whitelist address transfer spendable balance to whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.grantWhitelist(bobAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc20expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(aliceAddress, bobAddress, 1);
      expect(await erc20expWhitelist.balanceOf(aliceAddress)).equal(0);
      expect(await erc20expWhitelist.balanceOf(bobAddress)).equal(1);
      expect(await erc20expWhitelist.safeBalanceOf(bobAddress)).equal(1);
    });

    it("[HAPPY] whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.grantWhitelist(bobAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc20expWhitelist.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20expWhitelist.connect(alice).transferUnspendable(bobAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(aliceAddress, bobAddress, 1);
      expect(await erc20expWhitelist.balanceOf(aliceAddress)).equal(0);
      expect(await erc20expWhitelist.balanceOf(bobAddress)).equal(1);
      expect(await erc20expWhitelist.safeBalanceOf(bobAddress)).equal(0);
    });

    it("[UNHAPPY] whitelist address insufficient transfer un-spendable balance to whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.grantWhitelist(bobAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc20expWhitelist.connect(alice).transferUnspendable(bobAddress, 1)).to.be.revertedWithCustomError(
        erc20expWhitelist,
        ERROR_ERC20_INSUFFICIENT_BALANCE,
      );
    });

    it("[UNHAPPY] whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.grantWhitelist(bobAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc20expWhitelist.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.revertedWithCustomError(erc20expWhitelist, ERROR_ERC20_INSUFFICIENT_BALANCE)
        .withArgs(aliceAddress, 0, 1);
    });

    it("[UNHAPPY] whitelist address transfer un-spendable balance to non whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20expWhitelist.connect(alice).transfer(bobAddress, 1))
        .to.be.revertedWithCustomError(erc20expWhitelist, ERROR_ERC20_INSUFFICIENT_BALANCE)
        .withArgs(aliceAddress, 0, 1);
    });
  });
};
