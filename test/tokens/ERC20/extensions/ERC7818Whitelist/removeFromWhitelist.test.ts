import {expect} from "chai";
import {deployERC7818WhitelistSelector} from "./deployer.test";
import {constants, ERC7818Whitelist} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("RemoveFromWhitelist", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] removeFromWhitelist", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await expect(erc7818expWhitelist.removeFromWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.Unwhitelisted)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818expWhitelist.isWhitelist(alice.address)).to.equal(false);
    });

    it("[SUCCESS] removeFromWhitelist can clean whitelist balance", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.mintToWhitelist(alice.address, 2);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(2);
      await expect(erc7818expWhitelist.removeFromWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.Unwhitelisted)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818expWhitelist.isWhitelist(alice.address)).to.equal(false);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(0);
    });

    it("[FAILED] removeFromWhitelist with non-whitelist", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818WhitelistSelector({epochType});
      await expect(erc7818expWhitelist.removeFromWhitelist(alice.address)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.NotExistInWhitelist,
      );
    });
  });
};
