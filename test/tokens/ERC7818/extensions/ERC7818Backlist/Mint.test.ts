import {expect} from "chai";
import { deployERC7818Backlist } from "./utils.test";
import { ERC7818Backlist } from "../../../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] able mint to non blacklist", async function () {
      const {erc7818Backlist, alice} = await deployERC7818Backlist();

      expect(await erc7818Backlist.isBlacklisted(alice.address)).equal(false);

      await erc7818Backlist.mint(alice.address, 100);

      expect(await erc7818Backlist.balanceOf(alice.address)).equal(100);
    });

    it("[HAPPY] unable mint to blacklist", async function () {
      const {erc7818Backlist, alice} = await deployERC7818Backlist();

      await erc7818Backlist.addToBlacklist(alice.address);

      expect(await erc7818Backlist.isBlacklisted(alice.address)).equal(true);

      await expect(erc7818Backlist.mint(alice.address, 100))
        .to.revertedWithCustomError(erc7818Backlist, ERC7818Backlist.errors.BlacklistedAddress)
        .withArgs(alice.address);
    });
  });
};
