import {expect} from "chai";
import {deployERC7818SuspendSelector} from "./deployer.test";
import {constants, ERC7818Suspend} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("RemoveFromSuspend", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] removeFromSuspend", async function () {
      const {erc7818Suspend, deployer, alice} = await deployERC7818SuspendSelector({epochType});
      await erc7818Suspend.addToSuspend(alice.address);
      await expect(erc7818Suspend.removeFromSuspend(alice.address))
        .to.emit(erc7818Suspend, ERC7818Suspend.events.RemovedFromSuspend)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818Suspend.isSuspended(alice.address)).to.equal(false);
    });

    it("[FAILED] account not suspended", async function () {
      const {erc7818Suspend, alice} = await deployERC7818SuspendSelector({epochType});
      await expect(erc7818Suspend.removeFromSuspend(alice.address)).to.be.revertedWithCustomError(
        erc7818Suspend,
        ERC7818Suspend.errors.AccountNotSuspended,
      );
    });
  });
};
