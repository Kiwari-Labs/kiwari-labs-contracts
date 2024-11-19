import {expect} from "chai";
import {deployERC20EXBacklist} from "../../../../utils.test";
import {ERROR_BLACKLISTED_ADDRESS} from "../../../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] able transfer to non blacklist", async function () {
      const {erc20ExpBacklist, alice, bob} = await deployERC20EXBacklist();

      await erc20ExpBacklist.mint(alice.address, 100);

      expect(await erc20ExpBacklist.isBlacklisted(alice.address)).equal(false);
      expect(await erc20ExpBacklist.isBlacklisted(bob.address)).equal(false);

      await erc20ExpBacklist.connect(alice)["transfer(address,uint256)"](bob.address, 100);

      expect(await erc20ExpBacklist["balanceOf(address)"](bob.address)).equal(100);
    });

    it("[HAPPY] able transfer from non blacklist", async function () {
      const {erc20ExpBacklist, alice, bob} = await deployERC20EXBacklist();

      await erc20ExpBacklist.mint(alice.address, 100);
      await erc20ExpBacklist.connect(alice).approve(bob.address, 100);

      expect(await erc20ExpBacklist.isBlacklisted(alice.address)).equal(false);
      expect(await erc20ExpBacklist.isBlacklisted(bob.address)).equal(false);

      await erc20ExpBacklist.connect(bob)["transferFrom(address,address,uint256)"](alice.address, bob.address, 100);

      expect(await erc20ExpBacklist["balanceOf(address)"](bob.address)).equal(100);
    });

    it("[HAPPY] unable transfer to blacklist", async function () {
      const {erc20ExpBacklist, alice, bob} = await deployERC20EXBacklist();

      await erc20ExpBacklist.addToBlacklist(bob.address);

      expect(await erc20ExpBacklist.isBlacklisted(alice.address)).equal(false);
      expect(await erc20ExpBacklist.isBlacklisted(bob.address)).equal(true);

      await expect(erc20ExpBacklist.connect(alice)["transfer(address,uint256)"](bob.address, 100))
        .to.revertedWithCustomError(erc20ExpBacklist, ERROR_BLACKLISTED_ADDRESS)
        .withArgs(bob.address);
    });

    it("[HAPPY] unable transfer from blacklist", async function () {
      const {erc20ExpBacklist, alice, bob} = await deployERC20EXBacklist();

      await erc20ExpBacklist.mint(alice.address, 100);
      await erc20ExpBacklist.connect(alice).approve(bob.address, 100);

      await erc20ExpBacklist.addToBlacklist(alice.address);

      expect(await erc20ExpBacklist.isBlacklisted(alice.address)).equal(true);
      expect(await erc20ExpBacklist.isBlacklisted(bob.address)).equal(false);

      await expect(
        erc20ExpBacklist.connect(bob)["transferFrom(address,address,uint256)"](alice.address, bob.address, 100),
      )
        .to.revertedWithCustomError(erc20ExpBacklist, ERROR_BLACKLISTED_ADDRESS)
        .withArgs(alice.address);
    });
  });
};

