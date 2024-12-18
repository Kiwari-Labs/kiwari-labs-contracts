import {expect} from "chai";
import {hardhat_latestBlock, hardhat_reset} from "../../../utils.test";
import {deployERC20EXPBase} from "../base/deployer.test";
import {ERC20, constants} from "../../../constant.test";

export const run = async () => {
  describe("MintToEpoch", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mintToEpoch", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      const epoch = await erc20exp.currentEpoch();

      await expect(erc20exp.mintToEpoch(epoch, alice.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);

      const latestBlock = await hardhat_latestBlock();
      expect(await erc20exp.balanceOf(alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(amount);
      /* additional function */
      expect(await erc20exp.getWorldStateBalance(latestBlock));
      const list = await erc20exp.tokenList(alice.address, epoch);
      expect(list.length).to.equal(1);
      expect(list[0]).to.equal(latestBlock);
    });

    it("[FAILED] mintToEpoch to zero address", async function () {
      const {erc20exp} = await deployERC20EXPBase({});
      const epoch = await erc20exp.currentEpoch();
      await expect(erc20exp.mintToEpoch(epoch, constants.ZERO_ADDRESS, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidReceiver)
        .withArgs(constants.ZERO_ADDRESS);
    });
  });
};
