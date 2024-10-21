import {expect} from "chai";
import {deployLightWeightERC20EXPWhitelist} from "../../../../utils.test";
import {ZERO_ADDRESS} from "../../../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] mint to zero address", async function () {
      // TODO: add test case (suitable logic and event response).
    });
  });

  describe("Mint To Wholesaler", async function () {
    it("[HAPPY] correct mint", async function () {
      const {erc20expWhitelist, alice} = await deployLightWeightERC20EXPWhitelist({});
      const aliceAddress = await alice.getAddress();
      await expect(erc20expWhitelist.grantWholeSale(aliceAddress))
        .to.emit(erc20expWhitelist, "GrantWholeSale")
        .withArgs(aliceAddress, true);
      await expect(erc20expWhitelist.mintSpentWholeSale(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20expWhitelist.mintUnspentWholeSale(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      expect(await erc20expWhitelist["balanceOf(address)"](aliceAddress)).to.equal(2);
    });

    it("[UNHAPPY] mint to zero address", async function () {
      const {erc20expWhitelist} = await deployLightWeightERC20EXPWhitelist({});
      await expect(erc20expWhitelist.grantWholeSale(ZERO_ADDRESS))
        .to.emit(erc20expWhitelist, "GrantWholeSale")
        .withArgs(ZERO_ADDRESS, true);
      await expect(erc20expWhitelist.mintSpentWholeSale(ZERO_ADDRESS, 1)).to.be.revertedWithCustomError(
        erc20expWhitelist,
        "ERC20InvalidReceiver",
      );
      await expect(erc20expWhitelist.mintSpentWholeSale(ZERO_ADDRESS, 1)).to.be.revertedWithCustomError(
        erc20expWhitelist,
        "ERC20InvalidReceiver",
      );
    });

    it("[UNHAPPY] mint to non-wholesaler address", async function () {
      const {erc20expWhitelist} = await deployLightWeightERC20Base({});
      await expect(erc20expWhitelist.mintUnspentWholeSale(ZERO_ADDRESS, 1)).to.revertedWith(
        "can't mint non-expirable token to non wholesale account",
      );
    });
  });

  describe("Mint To Retailer", async function () {
    it("[HAPPY] correct mint", async function () {
      const {erc20expWhitelist, alice} = await deployLightWeightERC20Base({});
      const aliceAddress = await alice.getAddress();
      await expect(erc20expWhitelist.mintRetail(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      const balance = await erc20expWhitelist["balanceOf(address)"](aliceAddress);
      expect(balance).to.equal(1);
    });

    it("[UNHAPPY] mint to zero address", async function () {
      const {erc20expWhitelist} = await deployLightWeightERC20Base({});
      await expect(erc20expWhitelist.mintRetail(ZERO_ADDRESS, 1))
        .to.be.revertedWithCustomError(erc20expWhitelist, "ERC20InvalidReceiver")
        .withArgs(ZERO_ADDRESS);
    });

    it("[UNHAPPY] mint to non-retailer", async function () {
      const {erc20expWhitelist, alice} = await deployLightWeightERC20Base({});
      const aliceAddress = await alice.getAddress();
      await expect(erc20expWhitelist.grantWholeSale(aliceAddress))
        .to.emit(erc20expWhitelist, "GrantWholeSale")
        .withArgs(aliceAddress, true);
      await expect(erc20expWhitelist.mintRetail(aliceAddress, 1)).to.be.revertedWith(
        "can't mint expirable token to non retail account",
      );
    });
  });
};
function deployLightWeightERC20Base(): { erc20expWhitelist: any; alice: any; } | PromiseLike<{ erc20expWhitelist: any; alice: any; }> {
  throw new Error("Function not implemented.");
}

