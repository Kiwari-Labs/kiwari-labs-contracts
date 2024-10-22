import {expect} from "chai";
import {deployERC20EXPMintQuota} from "../../utils.test";
import {
  ZERO_ADDRESS,
  EVENT_QUOTA_SET,
  ERROR_INVALID_MINTER_ADDRESS,
  EVENT_QUOTA_RESET,
  EVENT_QUOTA_MINTED,
} from "../../constant.test";

export const run = async () => {
  describe("ResetQuota", async function () {
    it("[HAPPY] correct reset quota", async function () {
      const {erc20ExpMintQuota, deployer, alice} = await deployERC20EXPMintQuota();
      const deployerAddress = await deployer.getAddress();
      const aliceAddress = await alice.getAddress();
      const quota = 100;

      await expect(erc20ExpMintQuota.setQuota(aliceAddress, quota))
        .to.emit(erc20ExpMintQuota, EVENT_QUOTA_SET)
        .withArgs(deployerAddress, aliceAddress, quota);

      expect(await erc20ExpMintQuota.remainingQuota(aliceAddress)).equal(quota);

      await expect(erc20ExpMintQuota.connect(alice).mintQuota(aliceAddress, quota))
        .to.emit(erc20ExpMintQuota, EVENT_QUOTA_MINTED)
        .withArgs(aliceAddress, aliceAddress, quota);

      expect(await erc20ExpMintQuota.remainingQuota(aliceAddress)).equal(0);

      await expect(erc20ExpMintQuota.resetQuota(aliceAddress))
        .to.emit(erc20ExpMintQuota, EVENT_QUOTA_RESET)
        .withArgs(aliceAddress);

      expect(await erc20ExpMintQuota.remainingQuota(aliceAddress)).equal(quota);
    });

    it("[UNHAPPY] cannot reset quota of zero address", async function () {
      const {erc20ExpMintQuota} = await deployERC20EXPMintQuota();
      await expect(erc20ExpMintQuota.resetQuota(ZERO_ADDRESS)).to.be.revertedWithCustomError(
        erc20ExpMintQuota,
        ERROR_INVALID_MINTER_ADDRESS,
      );
    });
  });
};
