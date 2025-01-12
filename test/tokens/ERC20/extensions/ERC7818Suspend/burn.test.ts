import {expect} from "chai";
import {deployERC7818SuspendSelector} from "./deployer.test";
import {constants, ERC7818Suspend} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Burn", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] burn `from` non-suspended", async function () {
      const {erc7818Suspend, alice} = await deployERC7818SuspendSelector({epochType});
      await erc7818Suspend.mint(alice.address, amount);
      expect(await erc7818Suspend.isSuspended(alice.address)).to.equal(false);
      await erc7818Suspend.burn(alice.address, amount);
      expect(await erc7818Suspend.balanceOf(alice.address)).to.equal(0);
    });

    it("[FAILED] burn `from` suspended", async function () {
      const {erc7818Suspend, alice} = await deployERC7818SuspendSelector({epochType});
      await erc7818Suspend.mint(alice.address, amount);
      await erc7818Suspend.addToSuspend(alice.address);
      expect(await erc7818Suspend.isSuspended(alice.address)).to.equal(true);
      await expect(erc7818Suspend.burn(alice.address, amount))
        .to.revertedWithCustomError(erc7818Suspend, ERC7818Suspend.errors.AccountSuspended)
        .withArgs(alice.address);
    });
  });
};
