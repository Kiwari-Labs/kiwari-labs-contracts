import {expect} from "chai";
import {constants, ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuotaSelector} from "./deployer.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("IncreaseQuota", async function () {
    const quota = 100;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] increaseQuota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuotaSelector({epochType});

      await expect(erc7818MintQuota.addMinter(alice.address, quota));
      await expect(erc7818MintQuota.increaseQuota(alice.address, 10))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployer.address, alice.address, quota + 10);
      expect(await erc7818MintQuota.quota(alice.address)).to.equal(quota + 10);
    });

    it("[FAILED] minter not set", async function () {
      const {erc7818MintQuota, alice} = await deployERC7818MintQuotaSelector({epochType});
      await expect(erc7818MintQuota.increaseQuota(alice.address, quota)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.MinterNotSet,
      );
    });
  });
};
