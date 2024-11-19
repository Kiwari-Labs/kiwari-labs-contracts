import {expect} from "chai";
import {deployERC7818Backlist} from "./utils.test";
import {common, ERC7818Backlist} from "../../../../constant.test";
export const run = async () => {
  describe("Add To Blacklist", async function () {
    it("[HAPPY] correct blacklist", async function () {
      const {erc7818Backlist, deployer, alice} = await deployERC7818Backlist();

      await expect(erc7818Backlist.addToBlacklist(alice.address))
        .to.emit(erc7818Backlist, ERC7818Backlist.events.Blacklisted)
        .withArgs(deployer.address, alice.address);

      expect(await erc7818Backlist.isBlacklisted(alice.address)).equal(true);
    });

    it("[UNHAPPY] cannot backlist of zero address", async function () {
      const {erc7818Backlist} = await deployERC7818Backlist();

      await expect(erc7818Backlist.addToBlacklist(common.zeroAddress)).to.be.revertedWithCustomError(
        erc7818Backlist,
        ERC7818Backlist.errors.InvalidAddress,
      );
    });
  });
};
