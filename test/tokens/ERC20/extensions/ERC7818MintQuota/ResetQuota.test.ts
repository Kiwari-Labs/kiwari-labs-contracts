import {expect} from "chai";
import {common, ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuota} from "./utils.test";

export const run = async () => {
  describe("ResetQuota", async function () {
    it("[HAPPY] correct reset quota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();
      const deployerAddress = await deployer.getAddress();
      const aliceAddress = await alice.getAddress();
      const quota = 100;

      await expect(erc7818MintQuota.setQuota(aliceAddress, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployerAddress, aliceAddress, quota);

      expect(await erc7818MintQuota.remainingQuota(aliceAddress)).equal(quota);

      await expect(erc7818MintQuota.connect(alice).mintQuota(aliceAddress, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaMinted)
        .withArgs(aliceAddress, aliceAddress, quota);

      expect(await erc7818MintQuota.remainingQuota(aliceAddress)).equal(0);

      await expect(erc7818MintQuota.resetQuota(aliceAddress))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaReset)
        .withArgs(aliceAddress);

      expect(await erc7818MintQuota.remainingQuota(aliceAddress)).equal(quota);
    });

    it("[UNHAPPY] cannot reset quota of zero address", async function () {
      const {erc7818MintQuota} = await deployERC7818MintQuota();
      await expect(erc7818MintQuota.resetQuota(common.zeroAddress)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.InvalidMinterAddress,
      );
    });
  });
};
