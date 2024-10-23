import {expect} from "chai";
import {deployERC20EXPMintQuota} from "../../../../utils.test";
import {ZERO_ADDRESS, EVENT_QUOTA_SET, ERROR_INVALID_MINTER_ADDRESS} from "../../../../constant.test";

export const run = async () => {
  describe("SetQuota", async function () {
    it("[HAPPY] correct set quota", async function () {
      const {erc20ExpMintQuota, deployer, alice} = await deployERC20EXPMintQuota();
      const deployerAddress = await deployer.getAddress();
      const aliceAddress = await alice.getAddress();
      const quota = 100;

      await expect(erc20ExpMintQuota.setQuota(aliceAddress, quota))
        .to.emit(erc20ExpMintQuota, EVENT_QUOTA_SET)
        .withArgs(deployerAddress, aliceAddress, quota);

      expect(await erc20ExpMintQuota.remainingQuota(aliceAddress)).equal(quota);
    });

    it("[UNHAPPY] cannot set quota to zero address", async function () {
      const {erc20ExpMintQuota} = await deployERC20EXPMintQuota();
      const quota = 100;
      await expect(erc20ExpMintQuota.setQuota(ZERO_ADDRESS, quota)).to.be.revertedWithCustomError(
        erc20ExpMintQuota,
        ERROR_INVALID_MINTER_ADDRESS,
      );
    });
  });
};
