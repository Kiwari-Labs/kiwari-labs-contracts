import {expect} from "chai";
import {deployERC7818WhitelistSelector} from "./deployer.test";
import {ERC7818Whitelist, ERC20, constants} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Mint", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mint token to `to` whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await expect(erc7818expWhitelist.mintToWhitelist(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, 1);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(amount);
    });

    it("[FAILED] mint token to `to` non-whitelist", async function () {
      const {erc7818expWhitelist, alice} = await deployERC7818WhitelistSelector({epochType});
      await expect(erc7818expWhitelist.mintToWhitelist(alice.address, 1)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.InvalidWhitelistAddress,
      );
      expect(await erc7818expWhitelist.isWhitelist(alice.address)).to.equal(false);
    });
  });
};
