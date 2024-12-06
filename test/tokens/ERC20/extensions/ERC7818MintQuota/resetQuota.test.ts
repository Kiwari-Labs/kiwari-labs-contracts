import {expect} from "chai";
import {constants, ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuota} from "./deployer.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async () => {
  describe("ResetQuota", async function () {
    const quota = 100;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] resetQuota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();
      
      await expect(erc7818MintQuota.setQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployer.address, alice.address, quota);
      expect(await erc7818MintQuota.remainingQuota(alice.address)).to.equal(quota);
      await expect(erc7818MintQuota.connect(alice).mintQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaMinted)
        .withArgs(alice.address, alice.address, quota);
      expect(await erc7818MintQuota.remainingQuota(alice.address)).to.equal(0);
      await expect(erc7818MintQuota.resetQuota(alice.address))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaReset)
        .withArgs(alice.address);
      expect(await erc7818MintQuota.remainingQuota(alice.address)).to.equal(quota);
    });

    it("[FAILED] resetQuota of zero address", async function () {
      const {erc7818MintQuota} = await deployERC7818MintQuota();
      await expect(erc7818MintQuota.resetQuota(constants.ZeroAddress)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.InvalidMinterAddress,
      );
    });
  });
};
