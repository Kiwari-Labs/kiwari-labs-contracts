import {expect} from "chai";
import {deployERC20EXPBase} from "./deployer.test";
import {ERC20, constants} from "../../../constant.test";
import {hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("TransferFrom", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transferFrom", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});
      await erc20exp.mint(alice.address, amount);
      await erc20exp.connect(alice).approve(alice.address, amount);
      await expect(erc20exp.connect(bob).transferFrom(alice.address, alice.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, alice.address, amount);
      const epoch = await erc20exp.currentEpoch();
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(amount);
    });

    // @TODO transferFromAtEpoch
    it("[SUCCESS] transferFromAtEpoch", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});
      await erc20exp.mint(alice.address, amount);
      await erc20exp.connect(alice).approve(alice.address, amount);
      await expect(erc20exp.connect(bob).transferFrom(alice.address, alice.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, alice.address, amount);
      const epoch = await erc20exp.currentEpoch();
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(amount);
    });

    it("[SUCCESS] transferFrom with approve maximum", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});
      await erc20exp.mint(alice.address, amount);
      await erc20exp.connect(alice).approve(alice.address, constants.MaxUint256);
      await expect(erc20exp.connect(bob).transferFrom(alice.address, alice.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, alice.address, amount);
      const epoch = await erc20exp.currentEpoch();
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(amount);
    });

    it("[FAILED] transferFrom with insufficient allowance", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});
      await erc20exp.mint(alice.address, amount);
      await erc20exp.connect(alice).approve(alice.address, amount);
      await expect(erc20exp.connect(bob).transferFrom(alice.address, alice.address, amount + amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InsufficientAllowance)
        .withArgs(alice.address, amount, amount + amount);
      const epoch = await erc20exp.currentEpoch();
      expect(await erc20exp.balanceOf(alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(0);
    });
  });
};
