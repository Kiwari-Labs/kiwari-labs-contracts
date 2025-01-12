import {expect} from "chai";
import {constants, ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuotaSelector} from "./deployer.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ResetQuota", async function () {
    const quota = 100;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] resetQuota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuotaSelector({epochType});

      await expect(erc7818MintQuota.setQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployer.address, alice.address, quota);
      expect(await erc7818MintQuota.remainingQuota(alice.address)).to.equal(quota);
      await expect(erc7818MintQuota.connect(alice).mintWithQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaMinted)
        .withArgs(alice.address, alice.address, quota);
      expect(await erc7818MintQuota.remainingQuota(alice.address)).to.equal(0);
      await expect(erc7818MintQuota.resetQuota(alice.address))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaReset)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818MintQuota.remainingQuota(alice.address)).to.equal(quota);
    });

    it("[FAILED] minter not set", async function () {
      const {erc7818MintQuota} = await deployERC7818MintQuotaSelector({epochType});
      await expect(erc7818MintQuota.resetQuota(constants.ZERO_ADDRESS)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.MinterNotSet,
      );
    });
  });
};
