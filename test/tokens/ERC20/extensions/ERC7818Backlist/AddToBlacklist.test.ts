import {expect} from "chai";
import {deployERC20EXBacklist} from "./utils.test";
import {common, ERC7818Backlist} from "../../../../constant.test";
export const run = async () => {
  describe("Add To Blacklist", async function () {
    it("[HAPPY] correct blacklist", async function () {
      const {erc20ExpBacklist, deployer, alice} = await deployERC20EXBacklist();

      await expect(erc20ExpBacklist.addToBlacklist(alice.address))
        .to.emit(erc20ExpBacklist, ERC7818Backlist.events.Blacklisted)
        .withArgs(deployer.address, alice.address);

      expect(await erc20ExpBacklist.isBlacklisted(alice.address)).equal(true);
    });

    it("[UNHAPPY] cannot backlist of zero address", async function () {
      const {erc20ExpBacklist} = await deployERC20EXBacklist();

      await expect(erc20ExpBacklist.addToBlacklist(common.zeroAddress)).to.be.revertedWithCustomError(
        erc20ExpBacklist,
        ERC7818Backlist.errors.InvalidAddress,
      );
    });
  });
};
