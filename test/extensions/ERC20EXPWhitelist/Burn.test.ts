import {expect} from "chai";
import {deployERC20EXPWhitelist} from "../../utils.test";
import {
  ERC20_INSUFFICIENT_BALANCE,
  EVENT_WHITELIST_GRANTED,
  INVALID_WHITELIST_ADDRESS,
  ZERO_ADDRESS,
} from "../../constant.test";

export const run = async () => {
  describe("Burn", async function () {
    it("[HAPPY] correct burn spendable to whitelist address", async function () {
      const {erc20exp, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.burnSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(aliceAddress, ZERO_ADDRESS, 1);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] correct burn un-spendable to whitelist address", async function () {
      const {erc20exp, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20exp.burnUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20exp, "Transfer")
        .withArgs(aliceAddress, ZERO_ADDRESS, 1);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[UNHAPPY] cannot burn cause insufficient balance of whitelist address", async function () {
      const {erc20exp, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.burnUnspendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc20exp,
        ERC20_INSUFFICIENT_BALANCE,
      );
    });

    it("[UNHAPPY] cannot burn to spendable to non whitelist address", async function () {
      const {erc20exp, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.burnSpendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc20exp,
        INVALID_WHITELIST_ADDRESS,
      );
    });

    it("[UNHAPPY] cannot burn to un-spendable to non whitelist address", async function () {
      const {erc20exp, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.burnUnspendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc20exp,
        INVALID_WHITELIST_ADDRESS,
      );
    });
  });
};
