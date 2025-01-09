import {expect} from "chai";
import {deployERC20EXPBase} from "./deployer.test";
import {ERC20, constants} from "../../../constant.test";
import {ethers, hardhat_impersonate, hardhat_reset, hardhat_setBalance, hardhat_stopImpersonating, hardhat_mine} from "../../../utils.test";

export const run = async () => {
  describe("Transfer", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transfer", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});
      const epoch = await erc20exp.currentEpoch();
      await erc20exp.mint(alice.address, amount);
      await expect(erc20exp.connect(alice).transfer(bob.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(amount);
    });

    it("[SUCCESS] transfer with zero amount", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});
      await expect(erc20exp.connect(alice).transfer(bob.address, 0))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 0);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
    });

    it("[SUCCESS] transfer during epoch nearest expiry", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase();
      const blocksPerEpoch = await erc20exp.epochLength();

      let epochs = 2;
      const amount = 2;
      const iterate = 10;
      while (epochs != 0) {
        for (let i = 0; i < iterate; i++) {
          await erc20exp.mint(alice.address, amount);
        }
        await hardhat_mine(Number(blocksPerEpoch) - iterate - 1);
        epochs--;
      }

      let epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(1);

      await hardhat_mine(10);

      epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(2);

      const currentBalance = await erc20exp.balanceOf(alice.address);

      await expect(erc20exp.connect(alice).transfer(bob.address, currentBalance - 2n))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, currentBalance - 2n);
    });

    it("[SUCCESS] transfer multiple small token overlap epoch correctly", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase();
      const blocksPerEpoch = await erc20exp.epochLength();

      let epochs = 2;
      const amount = 2;
      const iterate = 10;
      while (epochs != 0) {
        for (let i = 0; i < iterate; i++) {
          await erc20exp.mint(alice.address, amount);
        }
        await hardhat_mine(Number(blocksPerEpoch) - iterate - 1);
        epochs--;
      }

      const epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(1);

      expect(await erc20exp.balanceOfAtEpoch(0, alice.address)).to.equal(20);
      expect(await erc20exp.balanceOfAtEpoch(1, alice.address)).to.equal(20);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(40);

      await expect(erc20exp.connect(alice).transfer(bob.address, 25))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 25);

      expect(await erc20exp.balanceOfAtEpoch(0, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(1, alice.address)).to.equal(15);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(15);
      expect(await erc20exp.balanceOfAtEpoch(0, bob.address)).to.equal(20);
      expect(await erc20exp.balanceOfAtEpoch(1, bob.address)).to.equal(5);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(25);
    });

    it("[FAILED] transfer with invalid sender", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});

      await hardhat_setBalance(constants.ZERO_ADDRESS, ethers.parseEther("10000.0").toString());
      await hardhat_impersonate(constants.ZERO_ADDRESS);
      const signer = await ethers.getImpersonatedSigner(constants.ZERO_ADDRESS);

      await expect(erc20exp.connect(signer).transfer(alice.address, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidSender)
        .withArgs(constants.ZERO_ADDRESS);

      await hardhat_stopImpersonating(constants.ZERO_ADDRESS);
    });

    it("[FAILED] transfer with invalid receiver", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      await expect(erc20exp.connect(alice).transfer(constants.ZERO_ADDRESS, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidReceiver)
        .withArgs(constants.ZERO_ADDRESS);
    });

    it("[FAILED] transfer with insufficient balance", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});
      await expect(erc20exp.connect(alice).transfer(bob.address, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, amount);
    });
  });
};
