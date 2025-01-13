import {expect} from "chai";
import {deployERC7818BlacklistSelector} from "./deployer.test";
import {constants, ERC7818Blacklist} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Transfer", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transfer `to` non-blacklisted", async function () {
      const {erc7818Blacklist, alice, bob} = await deployERC7818BlacklistSelector({epochType});
      await erc7818Blacklist.mint(alice.address, 100);
      expect(await erc7818Blacklist.isBlacklisted(alice.address)).to.equal(false);
      expect(await erc7818Blacklist.isBlacklisted(bob.address)).to.equal(false);
      await erc7818Blacklist.connect(alice).transfer(bob.address, 100);
      expect(await erc7818Blacklist.balanceOf(bob.address)).to.equal(100);
    });

    it("[SUCCESS] transfer `from` non-blacklisted", async function () {
      const {erc7818Blacklist, alice, bob} = await deployERC7818BlacklistSelector({epochType});
      await erc7818Blacklist.mint(alice.address, 100);
      await erc7818Blacklist.connect(alice).approve(bob.address, 100);
      expect(await erc7818Blacklist.isBlacklisted(alice.address)).to.equal(false);
      expect(await erc7818Blacklist.isBlacklisted(bob.address)).to.equal(false);
      await erc7818Blacklist.connect(bob).transferFrom(alice.address, bob.address, 100);
      expect(await erc7818Blacklist.balanceOf(bob.address)).to.equal(100);
    });

    it("[FAILED] transfer `to` blacklisted", async function () {
      const {erc7818Blacklist, alice, bob} = await deployERC7818BlacklistSelector({epochType});
      await erc7818Blacklist.addToBlacklist(bob.address);
      expect(await erc7818Blacklist.isBlacklisted(alice.address)).to.equal(false);
      expect(await erc7818Blacklist.isBlacklisted(bob.address)).to.equal(true);
      await expect(erc7818Blacklist.connect(alice).transfer(bob.address, 100))
        .to.revertedWithCustomError(erc7818Blacklist, ERC7818Blacklist.errors.AccountBlacklisted)
        .withArgs(bob.address);
    });

    it("[FAILED] transfer `from` blacklisted", async function () {
      const {erc7818Blacklist, alice, bob} = await deployERC7818BlacklistSelector({epochType});
      await erc7818Blacklist.mint(alice.address, 100);
      await erc7818Blacklist.connect(alice).approve(bob.address, 100);
      await erc7818Blacklist.addToBlacklist(alice.address);
      expect(await erc7818Blacklist.isBlacklisted(alice.address)).to.equal(true);
      expect(await erc7818Blacklist.isBlacklisted(bob.address)).to.equal(false);
      await expect(erc7818Blacklist.connect(bob).transferFrom(alice.address, bob.address, 100))
        .to.revertedWithCustomError(erc7818Blacklist, ERC7818Blacklist.errors.AccountBlacklisted)
        .withArgs(alice.address);
    });
  });
};
