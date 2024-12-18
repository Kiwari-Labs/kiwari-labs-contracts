import {expect} from "chai";
import {deployERC20EXPBase} from "./deployer.test";
import {ERC20, constants} from "../../../constant.test";
import {ethers, hardhat_impersonate, hardhat_reset, hardhat_setBalance, hardhat_stopImpersonating} from "../../../utils.test";
import {parseEther} from "ethers";

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

    it("[SUCCESS] transferAtEpoch", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});
      await erc20exp.mint(alice.address, amount);
      const epoch = await erc20exp.currentEpoch();
      await expect(erc20exp.connect(alice).transferAtEpoch(epoch, bob.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(amount);
    });

    // it("[SUCCESS] transfer single large token correctly", async function () {
    //   const windowSize = 2;
    //   const {erc20exp, alice, bob} = await deployERC20EXPBase({windowSize});
    //   const blocksPerEpoch = await erc20exp.epochLength();
    //   const blocksPerWindow = (await erc20exp.validityDuration()) * blocksPerEpoch;
    //   let epoch = await erc20exp.currentEpoch();
    //   expect(epoch).to.equal(0);
    //   const amount = 100;
    //   const expectAmount = 10;
    //   await expect(erc20exp.mint(alice.address, amount))
    //     .to.emit(erc20exp, ERC20.events.Transfer)
    //     .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
    //   expect(await erc20exp.balanceOf(alice.address)).to.equal(amount);
    //   await expect(erc20exp.connect(alice).transfer(bob.address, expectAmount))
    //     .to.emit(erc20exp, ERC20.events.Transfer)
    //     .withArgs(alice.address, bob.address, expectAmount);
    //   expect(await erc20exp.balanceOf(alice.address)).to.equal(amount - expectAmount);
    //   expect(await erc20exp.balanceOf(bob.address)).to.equal(expectAmount);
    //   await skipToBlock(blocksPerWindow + 2);
    //   epoch = await erc20exp.currentEpoch();
    //   expect(epoch).to.equal(2);
    //   expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
    // });

    // it("[SUCCESS] transfer multiple small token correctly", async function () {
    //   const windowSize = 2;
    //   const {erc20exp, alice, bob} = await deployERC20EXPBase({windowSize});
    //   const blocksPerEpoch = await erc20exp.epochLength();
    //   const blocksPerWindow = (await erc20exp.validityDuration()) * blocksPerEpoch;
    //   let epoch = await erc20exp.currentEpoch();
    //   expect(epoch).to.equal(0);
    //   const amount = 1;
    //   const iterate = 200;
    //   const expectBalance = iterate * amount;
    //   for (let index = 0; index < iterate; index++) {
    //     await erc20exp.mint(alice.address, amount);
    //   }
    //   expect(await erc20exp.balanceOf(alice.address)).to.equal(expectBalance);
    //   await expect(erc20exp.connect(alice).transfer(bob.address, expectBalance))
    //     .to.emit(erc20exp, ERC20.events.Transfer)
    //     .withArgs(alice.address, bob.address, expectBalance);
    //   expect(await erc20exp.balanceOf(bob.address)).to.equal(expectBalance);
    //   await skipToBlock(blocksPerWindow + iterate + 2);
    //   epoch = await erc20exp.currentEpoch();
    //   expect(epoch).to.equal(2);
    //   expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
    // });

    // @TODO mint and transfer overlap epoch
    // it("[SUCCESS] transfer multiple small token overlap epoch correctly", async function () {
    //   const windowSize = 2;
    //   const {erc20exp, alice, bob} = await deployERC20EXPBase({windowSize});
    //   const blocksPerEpoch = await erc20exp.epochLength();
    //   const blocksPerWindow = (await erc20exp.validityDuration()) * blocksPerEpoch;
    //   let epoch = await erc20exp.currentEpoch();
    //   console.log("🚀 ~ epoch:", epoch);
    //   expect(epoch).to.equal(0);
    //   const amount = 1;
    //   const iterate = 200;
    //   const expectBalance = iterate * amount;
    //   await skipToBlock(blocksPerEpoch - 100);
    //   for (let index = 0; index < iterate; index++) {
    //     await erc20exp.mint(alice.address, amount);
    //   }
    //   epoch = await erc20exp.currentEpoch();
    //   expect(epoch).to.equal(1);
    //   expect(await erc20exp.balanceOfAtEpoch(0, alice.address)).to.equal(100);
    //   expect(await erc20exp.balanceOfAtEpoch(1, alice.address)).to.equal(100);
    //   expect(await erc20exp.balanceOf(alice.address)).to.equal(expectBalance);
    //   await expect(erc20exp.connect(alice).transfer(bob.address, expectBalance))
    //     .to.emit(erc20exp, ERC20.events.Transfer)
    //     .withArgs(alice.address, bob.address, expectBalance);
    //   expect(await erc20exp.balanceOf(bob.address)).to.equal(expectBalance);
    //   await hardhat_mine(blocksPerWindow);
    //   epoch = await erc20exp.currentEpoch();
    //   expect(epoch).to.equal(3);
    //   expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
    // });

    it("[FAILED] transfer with invalid sender", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});

      await hardhat_setBalance(constants.ZERO_ADDRESS, parseEther("10000.0").toString());
      await hardhat_impersonate(constants.ZERO_ADDRESS);
      const signer = await ethers.getImpersonatedSigner(constants.ZERO_ADDRESS);

      await expect(erc20exp.connect(signer).transfer(alice.address, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidSender)
        .withArgs(constants.ZERO_ADDRESS);

      await hardhat_stopImpersonating(constants.ZERO_ADDRESS);
    });

    it("[FAILED] transferAtEpoch with invalid sender", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});

      await hardhat_setBalance(constants.ZERO_ADDRESS, parseEther("10000.0").toString());
      await hardhat_impersonate(constants.ZERO_ADDRESS);
      const signer = await ethers.getImpersonatedSigner(constants.ZERO_ADDRESS);

      const epoch = await erc20exp.currentEpoch();
      await expect(erc20exp.connect(signer).transferAtEpoch(epoch, alice.address, amount))
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

    it("[FAILED] transferAtEpoch with invalid receiver", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      const epoch = await erc20exp.currentEpoch();
      await expect(erc20exp.connect(alice).transferAtEpoch(epoch, constants.ZERO_ADDRESS, amount))
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
