import {expect} from "chai";
import {deployLightWeightERC20EXP} from "../../utils.test";
import {ZERO_ADDRESS} from "../../constant.test";

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
      const {erc20exp, alice} = await deployLightWeightERC20EXP();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.grantWholeSale(aliceAddress))
        .to.emit(erc20exp, "GrantWholeSale")
        .withArgs(aliceAddress, true);
      await expect(erc20exp.mintSpentWholeSale(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.mintUnspentWholeSale(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      expect(await erc20exp["balanceOf(address)"](aliceAddress)).to.equal(2);
    });

    it("[UNHAPPY] mint to zero address", async function () {
      const {erc20exp} = await deployLightWeightERC20EXP();
      await expect(erc20exp.grantWholeSale(ZERO_ADDRESS))
        .to.emit(erc20exp, "GrantWholeSale")
        .withArgs(ZERO_ADDRESS, true);
      await expect(erc20exp.mintSpentWholeSale(ZERO_ADDRESS, 1)).to.be.revertedWithCustomError(
        erc20exp,
        "ERC20InvalidReceiver",
      );
      await expect(erc20exp.mintSpentWholeSale(ZERO_ADDRESS, 1)).to.be.revertedWithCustomError(
        erc20exp,
        "ERC20InvalidReceiver",
      );
    });

    it("[UNHAPPY] mint to non-wholesaler address", async function () {
      const {erc20exp} = await deployLightWeightERC20EXP();
      await expect(erc20exp.mintUnspentWholeSale(ZERO_ADDRESS, 1)).to.revertedWith(
        "can't mint non-expirable token to non wholesale account",
      );
    });
  });

  describe("Mint To Retailer", async function () {
    it("[HAPPY] correct mint", async function () {
      const {erc20exp, alice} = await deployLightWeightERC20EXP();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.mintRetail(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      const balance = await erc20exp["balanceOf(address)"](aliceAddress);
      expect(balance).to.equal(1);
    });

    it("[UNHAPPY] mint to zero address", async function () {
      const {erc20exp} = await deployLightWeightERC20EXP();
      await expect(erc20exp.mintRetail(ZERO_ADDRESS, 1))
        .to.be.revertedWithCustomError(erc20exp, "ERC20InvalidReceiver")
        .withArgs(ZERO_ADDRESS);
    });

    it("[UNHAPPY] mint to non-retailer", async function () {
      const {erc20exp, alice} = await deployLightWeightERC20EXP();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.grantWholeSale(aliceAddress))
        .to.emit(erc20exp, "GrantWholeSale")
        .withArgs(aliceAddress, true);
      await expect(erc20exp.mintRetail(aliceAddress, 1)).to.be.revertedWith(
        "can't mint expirable token to non retail account",
      );
    });
  });
};
