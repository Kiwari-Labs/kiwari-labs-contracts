import {expect} from "chai";
import {common, ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuota} from "./utils.test";

export const run = async () => {
  describe("SetQuota", async function () {
    it("[HAPPY] correct set quota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();
      const deployerAddress = await deployer.getAddress();
      const aliceAddress = await alice.getAddress();
      const quota = 100;

      await expect(erc7818MintQuota.setQuota(aliceAddress, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployerAddress, aliceAddress, quota);

      expect(await erc7818MintQuota.remainingQuota(aliceAddress)).equal(quota);
    });

    it("[UNHAPPY] cannot set quota to zero address", async function () {
      const {erc7818MintQuota} = await deployERC7818MintQuota();
      const quota = 100;
      await expect(erc7818MintQuota.setQuota(common.zeroAddress, quota)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.InvalidMinterAddress,
      );
    });
  });
};
