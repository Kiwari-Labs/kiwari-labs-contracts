import {expect} from "chai";
import {deployERC20EXPWhitelist} from "../../utils.test";
import {
  EVENT_WHITELIST_GRANTED,
  EVENT_WHITELIST_REVOKED,
  INVALID_WHITELIST_ADDRESS_EXIST,
  INVALID_WHITELIST_ADDRESS_NOT_EXIST,
} from "../../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] granted whitelist address", async function () {
      const {erc20exp, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      expect(await erc20exp.whitelist(aliceAddress)).equal(true);
    });

    it("[HAPPY] revoked whitelist address", async function () {
      const {erc20exp, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.revokeWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_REVOKED)
        .withArgs(deployerAddress, aliceAddress);
      expect(await erc20exp.whitelist(aliceAddress)).equal(false);
    });

    it("[UNHAPPY] granted exist whitelist address", async function () {
      const {erc20exp, deployer, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      const deployerAddress = await deployer.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.grantWhitelist(aliceAddress)).to.be.revertedWithCustomError(
        erc20exp,
        INVALID_WHITELIST_ADDRESS_EXIST,
      );
    });

    it("[UNHAPPY] revoked non whitelist address", async function () {
      const {erc20exp, alice} = await deployERC20EXPWhitelist();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp.grantWhitelist(aliceAddress)).to.be.revertedWithCustomError(
        erc20exp,
        INVALID_WHITELIST_ADDRESS_NOT_EXIST,
      );
    });
  });
};
