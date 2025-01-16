import {expect} from "chai";
import {deployERC7818FrozenSelector} from "./deployer.test";
import {constants, ERC7818Frozen} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";
export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Freeze", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] freeze", async function () {
      const {erc7818Frozen, deployer, alice} = await deployERC7818FrozenSelector({epochType});
      await expect(erc7818Frozen.freeze(alice.address))
        .to.emit(erc7818Frozen, ERC7818Frozen.events.Freeze)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818Frozen.isFrozen(alice.address)).to.equal(true);
    });

    it("[FAILED] account frozen", async function () {
      const {erc7818Frozen, alice} = await deployERC7818FrozenSelector({epochType});
      await erc7818Frozen.freeze(alice.address);
      await expect(erc7818Frozen.freeze(alice.address)).to.be.revertedWithCustomError(erc7818Frozen, ERC7818Frozen.errors.AccountFrozen);
    });
  });
};
