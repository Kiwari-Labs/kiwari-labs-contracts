import {expect} from "chai";
import {deployERC7818Whitelist} from "./deployer.test";
import {ERC7818Whitelist, ERC20, constants} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async () => {
  describe("Transfer", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] whitelist transfer `to` non-whitelist ", async function () {
      const {erc7818expWhitelist, alice, bob, charlie} = await deployERC7818Whitelist();
      const jameAddress = await charlie.getAddress();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.mintSpendableWhitelist(alice.address, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(amount);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZeroAddress, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(amount);
      await expect(erc7818expWhitelist.connect(bob).transfer(jameAddress, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(bob.address, jameAddress, amount);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(0);
      expect(await erc7818expWhitelist.balanceOf(jameAddress)).to.equal(amount);
    });

    it("[SUCCESS] whitelist transfer spendable balance `to` non-whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      await expect(erc7818expWhitelist.addToWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.Whitelisted)
        .withArgs(deployer.address, alice.address);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZeroAddress, alice.address, amount);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZeroAddress, amount)
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZeroAddress, bob.address, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(amount);
      expect(await erc7818expWhitelist.safeBalanceOf(bob.address)).to.equal(0);
    });

    it("[SUCCESS] non-whitelist transfer un-spendable balance `to` whitelist address", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818Whitelist();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.mintSpendableWhitelist(alice.address, amount);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZeroAddress, amount)
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZeroAddress, bob.address, amount);
      await expect(erc7818expWhitelist.connect(bob).transfer(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(bob.address, constants.ZeroAddress, amount)
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZeroAddress, alice.address, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(amount);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(0);
      expect(await erc7818expWhitelist.safeBalanceOf(bob.address)).to.equal(0);
    });

    it("[SUCCESS] whitelist transfer spendable balance `to` whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.addToWhitelist(bob.address);
      await erc7818expWhitelist.mintSpendableWhitelist(alice.address, amount);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(amount);
      expect(await erc7818expWhitelist.safeBalanceOf(bob.address)).to.equal(amount);
    });

    it("[SUCCESS] whitelist transfer un-spendable balance `to` whitelist", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818Whitelist();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.addToWhitelist(bob.address);
      await erc7818expWhitelist.mintUnspendableWhitelist(alice.address, amount);
      await expect(erc7818expWhitelist.connect(alice).transferUnspendable(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(amount);
      expect(await erc7818expWhitelist.safeBalanceOf(bob.address)).to.equal(0);
    });

    it("[FAILED] whitelist transfer un-spendable balance `to` whitelist with insufficient", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818Whitelist();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.addToWhitelist(bob.address);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC20.errors.ERC20InsufficientBalance,
      );
    });

    it("[FAILED] whitelist transfer un-spendable balance `to` whitelist", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818Whitelist();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.addToWhitelist(bob.address);
      await erc7818expWhitelist.mintUnspendableWhitelist(alice.address, amount);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.be.revertedWithCustomError(erc7818expWhitelist, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, amount);
    });

    it("[FAILED] whitelist transfer un-spendable balance `to` non-whitelist", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818Whitelist();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.mintUnspendableWhitelist(alice.address, amount);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.be.revertedWithCustomError(erc7818expWhitelist, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, amount);
    });
  });
};
