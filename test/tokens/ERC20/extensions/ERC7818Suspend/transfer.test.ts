import {expect} from "chai";
import {deployERC7818SuspendSelector} from "./deployer.test";
import {constants, ERC7818Suspend} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Transfer", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transfer `to` non-suspended", async function () {
      const {erc7818Suspend, alice, bob} = await deployERC7818SuspendSelector({epochType});
      await erc7818Suspend.mint(alice.address, 100);
      expect(await erc7818Suspend.isSuspended(alice.address)).to.equal(false);
      expect(await erc7818Suspend.isSuspended(bob.address)).to.equal(false);
      await erc7818Suspend.connect(alice).transfer(bob.address, 100);
      expect(await erc7818Suspend.balanceOf(bob.address)).to.equal(100);
    });

    it("[SUCCESS] transfer `from` non-suspended", async function () {
      const {erc7818Suspend, alice, bob} = await deployERC7818SuspendSelector({epochType});
      await erc7818Suspend.mint(alice.address, 100);
      await erc7818Suspend.connect(alice).approve(bob.address, 100);
      expect(await erc7818Suspend.isSuspended(alice.address)).to.equal(false);
      expect(await erc7818Suspend.isSuspended(bob.address)).to.equal(false);
      await erc7818Suspend.connect(bob).transferFrom(alice.address, bob.address, 100);
      expect(await erc7818Suspend.balanceOf(bob.address)).to.equal(100);
    });

    it("[FAILED] transfer `to` suspended", async function () {
      const {erc7818Suspend, alice, bob} = await deployERC7818SuspendSelector({epochType});
      await erc7818Suspend.mint(alice.address, 100);
      await erc7818Suspend.addToSuspend(bob.address);
      expect(await erc7818Suspend.isSuspended(alice.address)).to.equal(false);
      expect(await erc7818Suspend.isSuspended(bob.address)).to.equal(true);
      await erc7818Suspend.connect(alice).transfer(bob.address, 100);
      expect(await erc7818Suspend.balanceOf(bob.address)).to.equal(100);
    });

    it("[FAILED] transfer `from` suspended", async function () {
      const {erc7818Suspend, alice, bob} = await deployERC7818SuspendSelector({epochType});
      await erc7818Suspend.mint(alice.address, 100);
      await erc7818Suspend.connect(alice).approve(bob.address, 100);
      await erc7818Suspend.addToSuspend(alice.address);
      expect(await erc7818Suspend.isSuspended(alice.address)).to.equal(true);
      expect(await erc7818Suspend.isSuspended(bob.address)).to.equal(false);
      await expect(erc7818Suspend.connect(bob).transferFrom(alice.address, bob.address, 100))
        .to.revertedWithCustomError(erc7818Suspend, ERC7818Suspend.errors.AccountSuspended)
        .withArgs(alice.address);
    });
  });
};
