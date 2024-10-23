import {expect} from "chai";
import {deployERC20EXBacklist} from "../../../../utils.test";
import {ZERO_ADDRESS, EVENT_BLACKLISTED, ERROR_INVALID_ADDRESS} from "../../../../constant.test";

export const run = async () => {
  describe("Add To Blacklist", async function () {
    it("[HAPPY] correct blacklist", async function () {
      const {erc20ExpBacklist, deployer, alice} = await deployERC20EXBacklist();

      await expect(erc20ExpBacklist.addToBlacklist(alice.address))
        .to.emit(erc20ExpBacklist, EVENT_BLACKLISTED)
        .withArgs(deployer.address, alice.address);

      expect(await erc20ExpBacklist.isBlacklisted(alice.address)).equal(true);
    });

    it("[UNHAPPY] cannot backlist of zero address", async function () {
      const {erc20ExpBacklist} = await deployERC20EXBacklist();

      await expect(erc20ExpBacklist.addToBlacklist(ZERO_ADDRESS)).to.be.revertedWithCustomError(
        erc20ExpBacklist,
        ERROR_INVALID_ADDRESS,
      );
    });
  });
};
