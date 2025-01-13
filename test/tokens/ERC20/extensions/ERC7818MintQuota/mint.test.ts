import {expect} from "chai";
import {constants, ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuotaSelector} from "./deployer.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Mint", async function () {
    const quota = 100;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mintQuota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuotaSelector({epochType});

      await erc7818MintQuota.addMinter(alice.address, quota);
      await expect(erc7818MintQuota.setQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployer.address, alice.address, quota);

      expect(await erc7818MintQuota.quota(alice.address)).to.equal(quota);
      expect(await erc7818MintQuota.minted(alice.address)).to.equal(0);

      await expect(erc7818MintQuota.connect(alice).mintWithQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaMinted)
        .withArgs(alice.address, alice.address, quota);

      expect(await erc7818MintQuota.quota(alice.address)).to.equal(0);
      expect(await erc7818MintQuota.minted(alice.address)).to.equal(quota);
      expect(await erc7818MintQuota.balanceOf(alice.address)).to.equal(quota);
    });

    it("[FAILED] minter not set", async function () {
      const {erc7818MintQuota, alice} = await deployERC7818MintQuotaSelector({epochType});
      await expect(erc7818MintQuota.mintWithQuota(alice.address, quota)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.MinterNotSet,
      );
    });

    it("[FAILED] mint quota exceeded", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuotaSelector({epochType});

      await erc7818MintQuota.addMinter(alice.address, quota);
      await expect(erc7818MintQuota.setQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployer.address, alice.address, quota);
      expect(await erc7818MintQuota.quota(alice.address)).to.equal(quota);
      expect(await erc7818MintQuota.minted(alice.address)).to.equal(0);
      await expect(erc7818MintQuota.connect(alice).mintWithQuota(alice.address, quota + quota)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.MintQuotaExceeded,
      );
    });
  });
};
