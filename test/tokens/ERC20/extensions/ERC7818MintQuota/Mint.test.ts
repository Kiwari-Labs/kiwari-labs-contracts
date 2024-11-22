import {expect} from "chai";
import {ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuota} from "./utils.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint quota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();
      const deployerAddress = await deployer.getAddress();

      const quota = 100;

      await expect(erc7818MintQuota.setQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployerAddress, alice.address, quota);

      expect(await erc7818MintQuota.remainingQuota(alice.address)).equal(quota);
      expect(await erc7818MintQuota.minted(alice.address)).equal(0);

      await expect(erc7818MintQuota.connect(alice).mintQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaMinted)
        .withArgs(alice.address, alice.address, quota);

      expect(await erc7818MintQuota.remainingQuota(alice.address)).equal(0);
      expect(await erc7818MintQuota.minted(alice.address)).equal(quota);
      expect(await erc7818MintQuota["balanceOf(address)"](alice.address)).equal(quota);
    });

    it("[UNHAPPY] unauthorized minter", async function () {
      const {erc7818MintQuota, alice} = await deployERC7818MintQuota();

      const quota = 100;
      await expect(erc7818MintQuota.mintQuota(alice.address, quota)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.UnauthorizedMinter,
      );
    });

    it("[UNHAPPY] unauthorized minter", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();
      const deployerAddress = await deployer.getAddress();

      const quota = 100;

      await expect(erc7818MintQuota.setQuota(alice.address, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployerAddress, alice.address, quota);

      expect(await erc7818MintQuota.remainingQuota(alice.address)).equal(quota);
      expect(await erc7818MintQuota.minted(alice.address)).equal(0);

      await expect(
        erc7818MintQuota.connect(alice).mintQuota(alice.address, quota + quota),
      ).to.be.revertedWithCustomError(erc7818MintQuota, ERC7818MintQuota.errors.MintQuotaExceeded);
    });
  });
};
