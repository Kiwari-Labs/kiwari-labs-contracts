import {expect} from "chai";
import {deployERC20EXPWhitelist} from "../../../../utils.test";
import {
  ERROR_ERC20_INSUFFICIENT_BALANCE,
  EVENT_TRANSFER,
  EVENT_WHITELIST_GRANTED,
  ERROR_INVALID_WHITELIST_ADDRESS,
  ZERO_ADDRESS,
} from "../../../../constant.test";

export const run = async () => {
  describe("Burn", async function () {
    it("[HAPPY] correct burn spendable to whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.mintSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20expWhitelist.burnSpendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 1);
      expect(await erc20expWhitelist["balanceOf(address)"](aliceAddress)).equal(0);
    });

    it("[HAPPY] correct burn un-spendable to whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.mintUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, 1);
      await expect(erc20expWhitelist.burnUnspendableWhitelist(aliceAddress, 1))
        .to.be.emit(erc20expWhitelist, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 1);
      expect(await erc20expWhitelist["balanceOf(address)"](aliceAddress)).equal(0);
    });

    it("[UNHAPPY] cannot burn cause insufficient balance of whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.burnUnspendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc20expWhitelist,
        ERROR_ERC20_INSUFFICIENT_BALANCE,
      );
    });

    it("[UNHAPPY] cannot burn to spendable to non whitelist address", async function () {
      const {erc20expWhitelist, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc20expWhitelist.burnSpendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc20expWhitelist,
        ERROR_INVALID_WHITELIST_ADDRESS,
      );
    });

    it("[UNHAPPY] cannot burn to un-spendable to non whitelist address", async function () {
      const {erc20expWhitelist, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc20expWhitelist.burnUnspendableWhitelist(aliceAddress, 1)).to.be.revertedWithCustomError(
        erc20expWhitelist,
        ERROR_INVALID_WHITELIST_ADDRESS,
      );
    });
  });
};

