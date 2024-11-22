import {expect} from "chai";
import {common, ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuota} from "./utils.test";

export const run = async () => {
  describe("ResetQuota", async function () {
    it("[HAPPY] correct reset quota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();
      const deployerAddress = await deployer.getAddress();

      const quota = 100;

      await expect(erc7818MintQuota.setQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployerAddress, alice.address, quota);

      expect(await erc7818MintQuota.remainingQuota(alice.address)).equal(quota);

      await expect(erc7818MintQuota.connect(alice).mintQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaMinted)
        .withArgs(alice.address, alice.address, quota);

      expect(await erc7818MintQuota.remainingQuota(alice.address)).equal(0);

      await expect(erc7818MintQuota.resetQuota(alice.address))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaReset)
        .withArgs(alice.address);

      expect(await erc7818MintQuota.remainingQuota(alice.address)).equal(quota);
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
