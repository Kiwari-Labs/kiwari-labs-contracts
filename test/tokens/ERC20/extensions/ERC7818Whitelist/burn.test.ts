import {expect} from "chai";
import {deployERC7818Whitelist} from "./deployer.test";
import {ERC7818Whitelist, ERC20, constants} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async () => {
  describe("Burn", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] burnSpendableWhitelist `to` whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      await expect(erc7818expWhitelist.addToWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.Whitelisted)
        .withArgs(deployer.address, alice.address);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZeroAddress, alice.address, amount);
      await expect(erc7818expWhitelist.burnSpendableWhitelist(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZeroAddress, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(0);
    });

    it("[SUCCESS] burnUnspendableWhitelist `to` whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      await expect(erc7818expWhitelist.addToWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.Whitelisted)
        .withArgs(deployer.address, alice.address);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZeroAddress, alice.address, amount);
      await expect(erc7818expWhitelist.burnUnspendableWhitelist(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZeroAddress, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(0);
    });

    it("[FAILED] cannot burn cause insufficient balance of whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      await expect(erc7818expWhitelist.addToWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.Whitelisted)
        .withArgs(deployer.address, alice.address);
      await expect(erc7818expWhitelist.burnUnspendableWhitelist(alice.address, amount)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC20.errors.ERC20InsufficientBalance,
      );
    });

    it("[FAILED] burnSpendableWhitelist `to` non-whitelist", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();
      await expect(erc7818expWhitelist.burnSpendableWhitelist(alice.address, amount)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
    });

    it("[FAILED] burnUnspendableWhitelist `to` non-whitelist", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();
      await expect(erc7818expWhitelist.burnUnspendableWhitelist(alice.address, amount)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
    });
  });
};
