import {expect} from "chai";
import {deployERC20EXPWhitelist} from "../../utils.test";
import {parseEther} from "ethers/lib/utils";
import {reset, time, mineUpTo} from "@nomicfoundation/hardhat-network-helpers";
import {erc20} from "../../../typechain-types/@openzeppelin/contracts/token";
import {
  ERC20_INSUFFICIENT_BALANCE,
  ERC20_INVALID_RECEIVER,
  ERC20_INVALID_SENDER,
  EVENT_TRANSFER,
  EVENT_WHITELIST_GRANTED,
  ZERO_ADDRESS,
} from "../../constant.test";

export const run = async () => {
  describe(EVENT_TRANSFER, async function () {
    it("[HAPPY] correct non whitelist transfer ", async function () {
      // TODO: add test case (suitable logic and event response).
    });
    it("[HAPPY] correct transferFrom", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    // In cases of Wholesale and Retail are still in the designing phase to be discussed later.
    it("[HAPPY] whitelist address transfer spendable balance to non whitelist address", async function () {
      const {erc20exp, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 1)
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, bobAddress, 1);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
      expect(await erc20exp.balanceOf(bobAddress)).equal(1);
      expect(await erc20exp.safeBalanceOf(bobAddress)).equal(0);
    });

    it("[HAPPY] non whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc20exp, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 1)
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, bobAddress, 1);
      await expect(erc20exp.connect(bob).transfer(aliceAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(bobAddress, ZERO_ADDRESS, 1)
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(1);
      expect(await erc20exp.balanceOf(bobAddress)).equal(0);
      expect(await erc20exp.safeBalanceOf(bobAddress)).equal(0);
    });

    it("[HAPPY] whitelist address transfer spendable balance to whitelist address", async function () {
      const {erc20exp, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.grantWhitelist(bobAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc20exp.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.connect(alice).transfer(bobAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, bobAddress, 1);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
      expect(await erc20exp.balanceOf(bobAddress)).equal(1);
      expect(await erc20exp.safeBalanceOf(bobAddress)).equal(1);
    });

    it("[HAPPY] whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc20exp, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.grantWhitelist(bobAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc20exp.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.connect(alice).transferUnspendable(bobAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, bobAddress, 1);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
      expect(await erc20exp.balanceOf(bobAddress)).equal(1);
      expect(await erc20exp.safeBalanceOf(bobAddress)).equal(0);
    });

    it("[UNHAPPY] whitelist address insufficient transfer un-spendable balance to whitelist address", async function () {
      const {erc20exp, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.grantWhitelist(bobAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc20exp.connect(alice).transferUnspendable(bobAddress, 1)).to.be.revertedWithCustomError(
        erc20exp,
        ERC20_INSUFFICIENT_BALANCE,
      );
    });

    it("[UNHAPPY] whitelist address transfer un-spendable balance to whitelist address", async function () {
      const {erc20exp, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.grantWhitelist(bobAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, bobAddress);
      await expect(erc20exp.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.connect(alice).transfer(bobAddress, 1))
        .to.be.revertedWithCustomError(erc20exp, ERC20_INSUFFICIENT_BALANCE)
        .withArgs(aliceAddress, 0, 1);
    });

    it("[UNHAPPY] whitelist address transfer un-spendable balance to non whitelist address", async function () {
      const {erc20exp, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.connect(alice).transfer(bobAddress, 1))
        .to.be.revertedWithCustomError(erc20exp, ERC20_INSUFFICIENT_BALANCE)
        .withArgs(aliceAddress, 0, 1);
    });
  });
};
