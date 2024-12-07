import {expect} from "chai";
import {constants, ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuota} from "./deployer.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async () => {
  describe("SetQuota", async function () {
    const quota = 100;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] setQuota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();

      await expect(erc7818MintQuota.setQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployer.address, alice.address, quota);
      expect(await erc7818MintQuota.remainingQuota(alice.address)).to.equal(quota);
    });

    it("[FAILED] setQuota to zero address", async function () {
      const {erc7818MintQuota} = await deployERC7818MintQuota();
      await expect(erc7818MintQuota.setQuota(constants.ZeroAddress, quota)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.InvalidMinterAddress,
      );
    });
  });
};
