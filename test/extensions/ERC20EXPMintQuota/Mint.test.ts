import {expect} from "chai";
import {deployERC20EXPMintQuota} from "../../utils.test";
import {
  EVENT_QUOTA_SET,
  ERROR_MINT_QUOTA_EXCEEDED,
  ERROR_UNAUTHORIZED_MINTER,
  EVENT_QUOTA_MINTED,
} from "../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint quota", async function () {
      const {erc20ExpMintQuota, deployer, alice} = await deployERC20EXPMintQuota();
      const deployerAddress = await deployer.getAddress();
      const aliceAddress = await alice.getAddress();
      const quota = 100;

      await expect(erc20ExpMintQuota.setQuota(aliceAddress, quota))
        .to.emit(erc20ExpMintQuota, EVENT_QUOTA_SET)
        .withArgs(deployerAddress, aliceAddress, quota);

      expect(await erc20ExpMintQuota.remainingQuota(aliceAddress)).equal(quota);
      expect(await erc20ExpMintQuota.minted(aliceAddress)).equal(0);

      await expect(erc20ExpMintQuota.connect(alice).mintQuota(aliceAddress, quota))
        .to.emit(erc20ExpMintQuota, EVENT_QUOTA_MINTED)
        .withArgs(aliceAddress, aliceAddress, quota);

      expect(await erc20ExpMintQuota.remainingQuota(aliceAddress)).equal(0);
      expect(await erc20ExpMintQuota.minted(aliceAddress)).equal(quota);
      expect(await erc20ExpMintQuota.balanceOf(aliceAddress)).equal(quota);
    });

    it("[UNHAPPY] unauthorized minter", async function () {
      const {erc20ExpMintQuota, alice} = await deployERC20EXPMintQuota();
      const aliceAddress = await alice.getAddress();
      const quota = 100;
      await expect(erc20ExpMintQuota.mintQuota(aliceAddress, quota)).to.be.revertedWithCustomError(
        erc20ExpMintQuota,
        ERROR_UNAUTHORIZED_MINTER,
      );
    });

    it("[UNHAPPY] unauthorized minter", async function () {
      const {erc20ExpMintQuota, deployer, alice} = await deployERC20EXPMintQuota();
      const deployerAddress = await deployer.getAddress();
      const aliceAddress = await alice.getAddress();
      const quota = 100;

      await expect(erc20ExpMintQuota.setQuota(aliceAddress, quota))
        .to.emit(erc20ExpMintQuota, EVENT_QUOTA_SET)
        .withArgs(deployerAddress, aliceAddress, quota);

      expect(await erc20ExpMintQuota.remainingQuota(aliceAddress)).equal(quota);
      expect(await erc20ExpMintQuota.minted(aliceAddress)).equal(0);

      await expect(
        erc20ExpMintQuota.connect(alice).mintQuota(aliceAddress, quota + quota),
      ).to.be.revertedWithCustomError(erc20ExpMintQuota, ERROR_MINT_QUOTA_EXCEEDED);
    });
  });
};
