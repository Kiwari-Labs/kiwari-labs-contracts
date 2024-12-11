import {expect} from "chai";
import {hardhat_reset} from "../../../utils.test";
import {deployERC20EXPBase} from "./deployer.test";
import {constants, ERC20} from "../../../constant.test";

export const run = async () => {
  describe("Burn", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] burn", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase();
      const epoch = await erc20exp.currentEpoch();
      await erc20exp.mint(alice.address, amount);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(amount);
      await expect(erc20exp.burn(alice.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
    });

    it("[FAILED] burn from zero address", async function () {
      const {erc20exp} = await deployERC20EXPBase({});
      await expect(erc20exp.burn(constants.ZERO_ADDRESS, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidSender)
        .withArgs(constants.ZERO_ADDRESS);
    });

    it("[FAILED] burn with insufficient balance", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      await expect(erc20exp.burn(alice.address, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, amount);
    });
  });
};
