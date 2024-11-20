import {expect} from "chai";
import {deployERC7818Backlist} from "./utils.test";
import {ERC7818Backlist} from "../../../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] able transfer to non blacklist", async function () {
      const {erc7818Backlist, alice, bob} = await deployERC7818Backlist();

      await erc7818Backlist.mint(alice.address, 100);

      expect(await erc7818Backlist.isBlacklisted(alice.address)).equal(false);
      expect(await erc7818Backlist.isBlacklisted(bob.address)).equal(false);

      await erc7818Backlist.connect(alice)["transfer(address,uint256)"](bob.address, 100);

      expect(await erc7818Backlist["balanceOf(address)"](bob.address)).equal(100);
    });

    it("[HAPPY] able transfer from non blacklist", async function () {
      const {erc7818Backlist, alice, bob} = await deployERC7818Backlist();

      await erc7818Backlist.mint(alice.address, 100);
      await erc7818Backlist.connect(alice).approve(bob.address, 100);

      expect(await erc7818Backlist.isBlacklisted(alice.address)).equal(false);
      expect(await erc7818Backlist.isBlacklisted(bob.address)).equal(false);

      await erc7818Backlist.connect(bob)["transferFrom(address,address,uint256)"](alice.address, bob.address, 100);

      expect(await erc7818Backlist["balanceOf(address)"](bob.address)).equal(100);
    });

    it("[HAPPY] unable transfer to blacklist", async function () {
      const {erc7818Backlist, alice, bob} = await deployERC7818Backlist();

      await erc7818Backlist.addToBlacklist(bob.address);

      expect(await erc7818Backlist.isBlacklisted(alice.address)).equal(false);
      expect(await erc7818Backlist.isBlacklisted(bob.address)).equal(true);

      await expect(erc7818Backlist.connect(alice)["transfer(address,uint256)"](bob.address, 100))
        .to.revertedWithCustomError(erc7818Backlist, ERC7818Backlist.errors.BlacklistedAddress)
        .withArgs(bob.address);
    });

    it("[HAPPY] unable transfer from blacklist", async function () {
      const {erc7818Backlist, alice, bob} = await deployERC7818Backlist();

      await erc7818Backlist.mint(alice.address, 100);
      await erc7818Backlist.connect(alice).approve(bob.address, 100);

      await erc7818Backlist.addToBlacklist(alice.address);

      expect(await erc7818Backlist.isBlacklisted(alice.address)).equal(true);
      expect(await erc7818Backlist.isBlacklisted(bob.address)).equal(false);

      await expect(
        erc7818Backlist.connect(bob)["transferFrom(address,address,uint256)"](alice.address, bob.address, 100),
      )
        .to.revertedWithCustomError(erc7818Backlist, ERC7818Backlist.errors.BlacklistedAddress)
        .withArgs(alice.address);
    });
  });
};
