import {expect} from "chai";
import {deployERC20EXBacklist} from "./utils.test";
import {common, ERC7818Backlist} from "../../../../constant.test";

export const run = async () => {
  describe("Remove From Blacklist", async function () {
    it("[HAPPY] correct unblacklist", async function () {
      const {erc20ExpBacklist, deployer, alice} = await deployERC20EXBacklist();

      await erc20ExpBacklist.addToBlacklist(alice.address);

      expect(await erc20ExpBacklist.isBlacklisted(alice.address)).equal(true);

      await expect(erc20ExpBacklist.removeFromBlacklist(alice.address))
        .to.emit(erc20ExpBacklist, ERC7818Backlist.events.Unblacklisted)
        .withArgs(deployer.address, alice.address);

      expect(await erc20ExpBacklist.isBlacklisted(alice.address)).equal(false);
    });

    it("[UNHAPPY] cannot unbacklist of zero address", async function () {
      const {erc20ExpBacklist} = await deployERC20EXBacklist();

      await expect(erc20ExpBacklist.removeFromBlacklist(common.zeroAddress)).to.be.revertedWithCustomError(
        erc20ExpBacklist,
        ERC7818Backlist.errors.InvalidAddress,
      );
    });
  });
};
