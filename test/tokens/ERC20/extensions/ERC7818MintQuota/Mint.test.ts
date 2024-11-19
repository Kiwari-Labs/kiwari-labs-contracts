import {expect} from "chai";
import {ERC7818MintQuota} from "../../../../constant.test";
import {deployERC7818MintQuota} from "./utils.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint quota", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();
      const deployerAddress = await deployer.getAddress();
      const aliceAddress = await alice.getAddress();
      const quota = 100;

      await expect(erc7818MintQuota.setQuota(aliceAddress, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployerAddress, aliceAddress, quota);

      expect(await erc7818MintQuota.remainingQuota(aliceAddress)).equal(quota);
      expect(await erc7818MintQuota.minted(aliceAddress)).equal(0);

      await expect(erc7818MintQuota.connect(alice).mintQuota(aliceAddress, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaMinted)
        .withArgs(aliceAddress, aliceAddress, quota);

      expect(await erc7818MintQuota.remainingQuota(aliceAddress)).equal(0);
      expect(await erc7818MintQuota.minted(aliceAddress)).equal(quota);
      expect(await erc7818MintQuota["balanceOf(address)"](aliceAddress)).equal(quota);
    });

    it("[UNHAPPY] unauthorized minter", async function () {
      const {erc7818MintQuota, alice} = await deployERC7818MintQuota();
      const aliceAddress = await alice.getAddress();
      const quota = 100;
      await expect(erc7818MintQuota.mintQuota(aliceAddress, quota)).to.be.revertedWithCustomError(
        erc7818MintQuota,
        ERC7818MintQuota.errors.UnauthorizedMinter,
      );
    });

    it("[UNHAPPY] unauthorized minter", async function () {
      const {erc7818MintQuota, deployer, alice} = await deployERC7818MintQuota();
      const deployerAddress = await deployer.getAddress();
      const aliceAddress = await alice.getAddress();
      const quota = 100;

      await expect(erc7818MintQuota.setQuota(aliceAddress, quota))
        .to.emit(erc7818MintQuota, ERC7818MintQuota.events.QuotaSet)
        .withArgs(deployerAddress, aliceAddress, quota);

      expect(await erc7818MintQuota.remainingQuota(aliceAddress)).equal(quota);
      expect(await erc7818MintQuota.minted(aliceAddress)).equal(0);

      await expect(
        erc7818MintQuota.connect(alice).mintQuota(aliceAddress, quota + quota),
      ).to.be.revertedWithCustomError(erc7818MintQuota, ERC7818MintQuota.errors.MintQuotaExceeded);
    });
  });
};
