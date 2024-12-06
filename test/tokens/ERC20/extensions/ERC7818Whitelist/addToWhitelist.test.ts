import {expect} from "chai";
import {deployERC7818Whitelist} from "./deployer.test";
import {ERC7818Whitelist} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async () => {
  describe("AddToWhitelist", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] addToWhitelist", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      await expect(erc7818expWhitelist.addToWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.Whitelisted)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818expWhitelist.isWhitelist(alice.address)).to.equal(true);
    });

    it("[FAILED] addToWhitelist with whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice} = await deployERC7818Whitelist();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await expect(erc7818expWhitelist.addToWhitelist(alice.address)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.ExistInWhitelist,
      );
    });
  });
};
