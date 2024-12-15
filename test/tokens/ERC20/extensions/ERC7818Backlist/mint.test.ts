import {expect} from "chai";
import {deployERC7818Backlist} from "./deployer.test";
import {ERC7818Backlist} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async () => {
  describe("Mint", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mint `to` non-blacklist", async function () {
      const {erc7818Backlist, alice} = await deployERC7818Backlist();
      expect(await erc7818Backlist.isBlacklisted(alice.address)).to.equal(false);
      await erc7818Backlist.mint(alice.address, amount);
      expect(await erc7818Backlist.balanceOf(alice.address)).to.equal(amount);
    });

    it("[FAILED] mint `to` blacklist", async function () {
      const {erc7818Backlist, alice} = await deployERC7818Backlist();
      await erc7818Backlist.addToBlacklist(alice.address);
      expect(await erc7818Backlist.isBlacklisted(alice.address)).to.equal(true);
      await expect(erc7818Backlist.mint(alice.address, amount))
        .to.revertedWithCustomError(erc7818Backlist, ERC7818Backlist.errors.BlacklistedAddress)
        .withArgs(alice.address);
    });
  });
};
