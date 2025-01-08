import {expect} from "chai";
import {deployERC7818Backlist} from "./deployer.test";
import {ERC7818Backlist} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async () => {
  describe("Transfer", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transfer `to` non-blacklist", async function () {
      const {erc7818Backlist, alice, bob} = await deployERC7818Backlist();
      await erc7818Backlist.mint(alice.address, 100);
      expect(await erc7818Backlist.isBlacklisted(alice.address)).to.equal(false);
      expect(await erc7818Backlist.isBlacklisted(bob.address)).to.equal(false);
      await erc7818Backlist.connect(alice).transfer(bob.address, 100);
      expect(await erc7818Backlist["balanceOf(address)"](bob.address)).to.equal(100);
    });

    it("[SUCCESS] transfer `from` non-blacklist", async function () {
      const {erc7818Backlist, alice, bob} = await deployERC7818Backlist();
      await erc7818Backlist.mint(alice.address, 100);
      await erc7818Backlist.connect(alice).approve(bob.address, 100);
      expect(await erc7818Backlist.isBlacklisted(alice.address)).to.equal(false);
      expect(await erc7818Backlist.isBlacklisted(bob.address)).to.equal(false);
      await erc7818Backlist.connect(bob).transferFrom(alice.address, bob.address, 100);
      expect(await erc7818Backlist["balanceOf(address)"](bob.address)).to.equal(100);
    });

    it("[FAILED] transfer `to` blacklist", async function () {
      const {erc7818Backlist, alice, bob} = await deployERC7818Backlist();
      await erc7818Backlist.addToBlacklist(bob.address);
      expect(await erc7818Backlist.isBlacklisted(alice.address)).to.equal(false);
      expect(await erc7818Backlist.isBlacklisted(bob.address)).to.equal(true);
      await expect(erc7818Backlist.connect(alice).transfer(bob.address, 100))
        .to.revertedWithCustomError(erc7818Backlist, ERC7818Backlist.errors.BlacklistedAddress)
        .withArgs(bob.address);
    });

    it("[FAILED] transfer `from` blacklist", async function () {
      const {erc7818Backlist, alice, bob} = await deployERC7818Backlist();
      await erc7818Backlist.mint(alice.address, 100);
      await erc7818Backlist.connect(alice).approve(bob.address, 100);
      await erc7818Backlist.addToBlacklist(alice.address);
      expect(await erc7818Backlist.isBlacklisted(alice.address)).to.equal(true);
      expect(await erc7818Backlist.isBlacklisted(bob.address)).to.equal(false);
      await expect(erc7818Backlist.connect(bob).transferFrom(alice.address, bob.address, 100))
        .to.revertedWithCustomError(erc7818Backlist, ERC7818Backlist.errors.BlacklistedAddress)
        .withArgs(alice.address);
    });
  });
};
