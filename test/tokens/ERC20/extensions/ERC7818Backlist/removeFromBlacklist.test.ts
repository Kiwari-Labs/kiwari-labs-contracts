import {expect} from "chai";
import {deployERC7818BacklistSelector} from "./deployer.test";
import {constants, ERC7818Backlist} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("RemoveFromBlacklist", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] removeFromBlacklist", async function () {
      const {erc7818Backlist, deployer, alice} = await deployERC7818BacklistSelector({epochType});
      await erc7818Backlist.addToBlacklist(alice.address);
      await expect(erc7818Backlist.removeFromBlacklist(alice.address))
        .to.emit(erc7818Backlist, ERC7818Backlist.events.RemovedFromBlacklist)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818Backlist.isBlacklisted(alice.address)).to.equal(false);
    });

    it("[FAILED] account not blacklisted", async function () {
      const {erc7818Backlist, alice} = await deployERC7818BacklistSelector({epochType});
      await expect(erc7818Backlist.removeFromBlacklist(alice.address)).to.be.revertedWithCustomError(
        erc7818Backlist,
        ERC7818Backlist.errors.AccountNotBlacklisted,
      );
    });
  });
};
