import {expect} from "chai";
import {deployERC7818Backlist} from "./utils.test";
import {common, ERC7818Backlist} from "../../../../constant.test";

export const run = async () => {
  describe("Remove From Blacklist", async function () {
    it("[HAPPY] correct unblacklist", async function () {
      const {erc7818Backlist, deployer, alice} = await deployERC7818Backlist();

      await erc7818Backlist.addToBlacklist(alice.address);

      expect(await erc7818Backlist.isBlacklisted(alice.address)).equal(true);

      await expect(erc7818Backlist.removeFromBlacklist(alice.address))
        .to.emit(erc7818Backlist, ERC7818Backlist.events.Unblacklisted)
        .withArgs(deployer.address, alice.address);

      expect(await erc7818Backlist.isBlacklisted(alice.address)).equal(false);
    });

    it("[UNHAPPY] cannot unbacklist of zero address", async function () {
      const {erc7818Backlist} = await deployERC7818Backlist();

      await expect(erc7818Backlist.removeFromBlacklist(common.zeroAddress)).to.be.revertedWithCustomError(
        erc7818Backlist,
        ERC7818Backlist.errors.InvalidAddress,
      );
    });
  });
};
