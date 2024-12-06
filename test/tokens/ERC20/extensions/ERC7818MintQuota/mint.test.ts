import {expect} from "chai";
import {ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuota} from "./deployer.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async () => {
  describe("Mint", async function () {
    const quota = 100;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mintQuota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();
      

      await expect(erc7818MintQuota.setQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployer.address, alice.address, quota);

      expect(await erc7818MintQuota.remainingQuota(alice.address)).to.equal(quota);
      expect(await erc7818MintQuota.minted(alice.address)).to.equal(0);

      await expect(erc7818MintQuota.connect(alice).mintQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaMinted)
        .withArgs(alice.address, alice.address, quota);

      expect(await erc7818MintQuota.remainingQuota(alice.address)).to.equal(0);
      expect(await erc7818MintQuota.minted(alice.address)).to.equal(quota);
      expect(await erc7818MintQuota["balanceOf(address)"](alice.address)).to.equal(quota);
    });

    it("[FAILED] mintQuota with unauthorized minter", async function () {
      const {erc7818MintQuota, alice} = await deployERC7818MintQuota();
      await expect(erc7818MintQuota.mintQuota(alice.address, quota)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.UnauthorizedMinter,
      );
    });

    /* behavior */
    it("[FAILED] mintQuota with no longer authorized minter", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();
      
      await expect(erc7818MintQuota.setQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployer.address, alice.address, quota);
      expect(await erc7818MintQuota.remainingQuota(alice.address)).to.equal(quota);
      expect(await erc7818MintQuota.minted(alice.address)).to.equal(0);
      await expect(
        erc7818MintQuota.connect(alice).mintQuota(alice.address, quota + quota),
      ).to.be.revertedWithCustomError(erc7818MintQuota, ERC7818MintQuota.errors.MintQuotaExceeded);
    });
  });
};
