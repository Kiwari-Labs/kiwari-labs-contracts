import {expect} from "chai";
import { deployERC20EXBacklist } from "./utils.test";
import { ERC7818Backlist } from "../../../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] able mint to non blacklist", async function () {
      const {erc20ExpBacklist, alice} = await deployERC20EXBacklist();

      expect(await erc20ExpBacklist.isBlacklisted(alice.address)).equal(false);

      await erc20ExpBacklist.mint(alice.address, 100);

      expect(await erc20ExpBacklist.balanceOf(alice.address)).equal(100);
    });

    it("[HAPPY] unable mint to blacklist", async function () {
      const {erc20ExpBacklist, alice} = await deployERC20EXBacklist();

      await erc20ExpBacklist.addToBlacklist(alice.address);

      expect(await erc20ExpBacklist.isBlacklisted(alice.address)).equal(true);

      await expect(erc20ExpBacklist.mint(alice.address, 100))
        .to.revertedWithCustomError(erc20ExpBacklist, ERC7818Backlist.errors.BlacklistedAddress)
        .withArgs(alice.address);
    });
  });
};
