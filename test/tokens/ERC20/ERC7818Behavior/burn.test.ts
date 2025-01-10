import {expect} from "chai";
import {deployERC20Selector} from "../base/deployer.test";
import {ERC20, constants} from "../../../constant.test";
import {hardhat_increasePointerTo, hardhat_reset} from "../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Burn", async function () {
    const amount = 2;
    const iterate = 10;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] burn during epoch nearest expiry", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      const blocksPerEpoch = await erc20exp.epochLength();

      let epochs = 2;
      while (epochs != 0) {
        for (let i = 0; i < iterate; i++) {
          await erc20exp.mint(alice.address, amount);
        }
        await hardhat_increasePointerTo(epochType, Number(blocksPerEpoch) - iterate - 1);
        epochs--;
      }

      let epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(1);

      await hardhat_increasePointerTo(epochType, 10);

      epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(2);

      const currentBalance = await erc20exp.balanceOf(alice.address);

      await expect(erc20exp.burn(alice.address, currentBalance - 5n))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, currentBalance - 5n);
    });
  });
};
