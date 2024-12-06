import {expect} from "chai";
import {deployERC7818Whitelist} from "./deployer.test";
import {ERC7818Whitelist, ERC20, constants} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async () => {
  describe("Mint", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mintSpendableWhitelist `to` whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZeroAddress, alice.address, 1);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(amount);
      expect(await erc7818expWhitelist.safeBalanceOf(alice.address)).to.equal(amount);
    });

    it("[SUCCESS] mintUnspendableWhitelist `to` whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZeroAddress, alice.address, 1);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(amount);
      expect(await erc7818expWhitelist.safeBalanceOf(alice.address)).to.equal(0);
    });

    it("[FAILED] mintSpendableWhitelist `to` non-whitelist", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
      expect(await erc7818expWhitelist.isWhitelist(alice.address)).to.equal(false);
    });

    it("[FAILED] mintUnspendableWhitelist `to` non-whitelist", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818Whitelist();
      await expect(erc7818expWhitelist.mintUnspendableWhitelist(alice.address, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
      expect(await erc7818expWhitelist.isWhitelist(alice.address)).to.equal(false);
    });
  });
};
