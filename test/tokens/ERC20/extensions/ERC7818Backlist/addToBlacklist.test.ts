import {expect} from "chai";
import {deployERC7818Backlist} from "./deployer.test";
import {constants, ERC7818Backlist} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";
export const run = async () => {
  describe("AddToBlacklist", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] addToBlacklist", async function () {
      const {erc7818Backlist, deployer, alice} = await deployERC7818Backlist();
      await expect(erc7818Backlist.addToBlacklist(alice.address))
        .to.emit(erc7818Backlist, ERC7818Backlist.events.Blacklisted)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818Backlist.isBlacklisted(alice.address)).to.equal(true);
    });

    it("[FAILED] addToBlacklist with zero address", async function () {
      const {erc7818Backlist} = await deployERC7818Backlist();
      await expect(erc7818Backlist.addToBlacklist(constants.ZeroAddress)).to.be.revertedWithCustomError(
        erc7818Backlist,
        ERC7818Backlist.errors.InvalidAddress,
      );
    });
  });
};
