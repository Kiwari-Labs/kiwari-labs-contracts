import {expect} from "chai";
import {deployERC20EXPWhitelist} from "../../../../utils.test";
import {
  EVENT_WHITELIST_GRANTED,
  EVENT_WHITELIST_REVOKED,
  ERROR_EXIST_IN_WHITELIST,
  ERROR_NOT_EXIST_IN_WHITELIST,
} from "../../../../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] granted whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      expect(await erc20expWhitelist.whitelist(aliceAddress)).equal(true);
    });

    it("[HAPPY] revoked whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.revokeWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_REVOKED)
        .withArgs(deployerAddress, aliceAddress);
      expect(await erc20expWhitelist.whitelist(aliceAddress)).equal(false);
    });

    it("[HAPPY] revoked can clean whitelist address balance", async function () {
      const {erc20expWhitelist, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await erc20expWhitelist.mintSpendableWhitelist(aliceAddress, 1);
      await erc20expWhitelist.mintUnspendableWhitelist(aliceAddress, 1);
      expect(await erc20expWhitelist["balanceOf(address)"](aliceAddress)).equal(2);
      expect(await erc20expWhitelist.safeBalanceOf(aliceAddress)).equal(1);
      await expect(erc20expWhitelist.revokeWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_REVOKED)
        .withArgs(deployerAddress, aliceAddress);
      expect(await erc20expWhitelist.whitelist(aliceAddress)).equal(false);
    });

    it("[UNHAPPY] granted exist whitelist address", async function () {
      const {erc20expWhitelist, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc20expWhitelist, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20expWhitelist.grantWhitelist(aliceAddress)).to.be.revertedWithCustomError(
        erc20expWhitelist,
        ERROR_EXIST_IN_WHITELIST,
      );
    });

    it("[UNHAPPY] revoked non whitelist address", async function () {
      const {erc20expWhitelist, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc20expWhitelist.revokeWhitelist(aliceAddress)).to.be.revertedWithCustomError(
        erc20expWhitelist,
        ERROR_NOT_EXIST_IN_WHITELIST,
      );
    });
  });
};
