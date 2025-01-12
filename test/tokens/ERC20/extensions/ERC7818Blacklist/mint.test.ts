import {expect} from "chai";
import {deployERC7818BlacklistSelector} from "./deployer.test";
import {constants, ERC7818Blacklist} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Mint", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mint `to` non-blacklist", async function () {
      const {erc7818Backlist, alice} = await deployERC7818BlacklistSelector({epochType});
      expect(await erc7818Backlist.isBlacklisted(alice.address)).to.equal(false);
      await erc7818Backlist.mint(alice.address, amount);
      expect(await erc7818Backlist.balanceOf(alice.address)).to.equal(amount);
    });

    it("[FAILED] mint `to` blacklist", async function () {
      const {erc7818Backlist, alice} = await deployERC7818BlacklistSelector({epochType});
      await erc7818Backlist.addToBlacklist(alice.address);
      expect(await erc7818Backlist.isBlacklisted(alice.address)).to.equal(true);
      await expect(erc7818Backlist.mint(alice.address, amount))
        .to.revertedWithCustomError(erc7818Backlist, ERC7818Blacklist.errors.AccountBlacklisted)
        .withArgs(alice.address);
    });
  });
};
