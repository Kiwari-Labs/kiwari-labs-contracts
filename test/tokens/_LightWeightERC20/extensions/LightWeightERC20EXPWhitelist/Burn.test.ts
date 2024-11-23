import {expect} from "chai";
import {deployLightWeightERC20EXPWhitelist} from "../../../../utils.test";
import {ZERO_ADDRESS} from "../../../../constant.test";

export const run = async () => {
  describe("Burn", async function () {
    it("[HAPPY] correct burn", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] can burn only own token", async function () {
      // TODO: add test case (suitable logic and event response).
    });
  });

  describe("Burn From Wholesaler", async function () {
    it("[HAPPY] correct burn", async function () {
      const {erc20expWhitelist, alice} = await deployLightWeightERC20EXPWhitelist({});

      await expect(erc20expWhitelist.grantWholeSale(alice.address))
        .to.emit(erc20expWhitelist, "GrantWholeSale")
        .withArgs(alice.address, true);
      await expect(erc20expWhitelist.mintSpentWholeSale(alice.address, 1))
        .to.be.emit(erc20expWhitelist, "Transfer")
        .withArgs(ZERO_ADDRESS, alice.address, 1);
      await expect(erc20expWhitelist.mintUnspentWholeSale(alice.address, 1))
        .to.be.emit(erc20expWhitelist, "Transfer")
        .withArgs(ZERO_ADDRESS, alice.address, 1);
      await expect(erc20expWhitelist.burnSpentWholeSale(alice.address, 1))
        .to.be.emit(erc20expWhitelist, "Transfer")
        .withArgs(alice.address, ZERO_ADDRESS, 1);
      await expect(erc20expWhitelist.burnUnspentWholeSale(alice.address, 1))
        .to.be.emit(erc20expWhitelist, "Transfer")
        .withArgs(alice.address, ZERO_ADDRESS, 1);
      expect(await erc20expWhitelist["balanceOf(address)"](alice.address)).to.equal(0);
    });

    it("[UNHAPPY] burn from non-wholesaler", async function () {
      const {erc20expWhitelist, alice} = await deployLightWeightERC20EXPWhitelist({});

      await expect(erc20expWhitelist.burnSpentWholeSale(alice.address, 1)).to.be.revertedWith(
        "can't burn non-expirable token to non wholesale account",
      );
      await expect(erc20expWhitelist.burnUnspentWholeSale(alice.address, 1)).to.be.revertedWith(
        "can't burn non-expirable token to non wholesale account",
      );
    });

    it("[UNHAPPY] insufficient balance to burn", async function () {
      const {erc20expWhitelist, alice} = await deployLightWeightERC20EXPWhitelist({});

      await expect(erc20expWhitelist.grantWholeSale(alice.address))
        .to.emit(erc20expWhitelist, "GrantWholeSale")
        .withArgs(alice.address, true);
      await expect(erc20expWhitelist.burnSpentWholeSale(alice.address, 1))
        .to.be.revertedWithCustomError(erc20expWhitelist, "ERC20InsufficientBalance")
        .withArgs(alice.address, 0, 1);
      await expect(erc20expWhitelist.burnUnspentWholeSale(alice.address, 1))
        .to.be.revertedWithCustomError(erc20expWhitelist, "ERC20InsufficientBalance")
        .withArgs(alice.address, 0, 1);
    });
  });

  describe("Burn From Retailer", async function () {
    it("[HAPPY] correct burn", async function () {
      const {erc20expWhitelist, alice} = await deployLightWeightERC20EXPWhitelist({});

      const beforeBalance = await erc20expWhitelist["balanceOf(address)"](alice.address);
      await erc20expWhitelist.mintRetail(alice.address, 1);
      expect(beforeBalance).to.equal(0);
      expect(await erc20expWhitelist["balanceOf(address)"](alice.address)).to.equal(1);
      await expect(erc20expWhitelist.burnRetail(alice.address, 1))
        .to.emit(erc20expWhitelist, "Transfer")
        .withArgs(alice.address, ZERO_ADDRESS, 1);
      expect(await erc20expWhitelist["balanceOf(address)"](alice.address)).to.equal(0);
    });

    it("[UNHAPPY] burn from non-retailer", async function () {
      // TODO: add test case (suitable logic and event response).
      const {erc20expWhitelist, alice} = await deployLightWeightERC20EXPWhitelist({});

      await erc20expWhitelist.grantWholeSale(alice.address);
      await expect(erc20expWhitelist.burnRetail(alice.address, 1)).to.be.revertedWith(
        "can't burn expirable token to non retail account",
      );
    });

    it("[UNHAPPY] insufficient balance to burn", async function () {
      // TODO: add test case (suitable logic and event response).
      const {erc20expWhitelist, alice} = await deployLightWeightERC20EXPWhitelist({});

      await expect(erc20expWhitelist.burnRetail(alice.address, 1))
        .to.be.revertedWithCustomError(erc20expWhitelist, "ERC20InsufficientBalance")
        .withArgs(alice.address, 0, 1);
    });
  });
};
