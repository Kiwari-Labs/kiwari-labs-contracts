import {expect} from "chai";
import {deployERC7818SuspendSelector} from "./deployer.test";
import {constants, ERC7818Suspend} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Mint", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mint `to` non-suspended", async function () {
      const {erc7818Suspend, alice} = await deployERC7818SuspendSelector({epochType});
      expect(await erc7818Suspend.isSuspended(alice.address)).to.equal(false);
      await erc7818Suspend.mint(alice.address, amount);
      expect(await erc7818Suspend.balanceOf(alice.address)).to.equal(amount);
    });

    it("[FAILED] mint `to` suspended", async function () {
      const {erc7818Suspend, alice} = await deployERC7818SuspendSelector({epochType});
      await erc7818Suspend.addToSuspend(alice.address);
      expect(await erc7818Suspend.isSuspended(alice.address)).to.equal(true);
      await erc7818Suspend.mint(alice.address, amount);
      expect(await erc7818Suspend.balanceOf(alice.address)).to.equal(amount);
    });
  });
};
