import {expect} from "chai";
import {deployERC20Selector} from "../base/deployer.test";
import {ERC20, ERC7818, constants} from "../../../constant.test";
import {
  ethers,
  hardhat_impersonate,
  hardhat_increasePointerTo,
  hardhat_reset,
  hardhat_setBalance,
  hardhat_stopImpersonating,
} from "../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("TransferAtEpoch", async function () {
    const amount = 1;
    const iterate = 10;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transferAtEpoch", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
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

    it("[FAILED] transferAtEpoch with invalid sender", async function () {
      const {erc20exp, alice} = await deployERC20Selector({epochType});

      await hardhat_setBalance(constants.ZERO_ADDRESS, ethers.parseEther("10000.0").toString());
      await hardhat_impersonate(constants.ZERO_ADDRESS);
      const signer = await ethers.getImpersonatedSigner(constants.ZERO_ADDRESS);

      const epoch = await erc20exp.currentEpoch();
      await expect(erc20exp.connect(signer).transferAtEpoch(epoch, alice.address, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidSender)
        .withArgs(constants.ZERO_ADDRESS);

      await hardhat_stopImpersonating(constants.ZERO_ADDRESS);
    });

    it("[FAILED] transferAtEpoch with invalid receiver", async function () {
      const {erc20exp, alice} = await deployERC20Selector({epochType});
      const epoch = await erc20exp.currentEpoch();
      await expect(erc20exp.connect(alice).transferAtEpoch(epoch, constants.ZERO_ADDRESS, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidReceiver)
        .withArgs(constants.ZERO_ADDRESS);
    });

    it("[FAILED] transferAtEpoch with expired epoch", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      await erc20exp.mint(alice.address, amount);

      const epochLength = await erc20exp.epochLength();
      const duration = await erc20exp.validityDuration();

      await hardhat_increasePointerTo(epochType, epochLength * duration + epochLength);

      await expect(erc20exp.connect(alice).transferAtEpoch(0, bob.address, amount)).to.be.revertedWithCustomError(
        erc20exp,
        ERC7818.errors.ERC7818TransferredExpiredToken,
      );

      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);

      expect(await erc20exp.balanceOfAtEpoch(0, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(0, bob.address)).to.equal(0);
    });

    it("[FAILED] transfer with insufficient balance", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});
      const epoch = await erc20exp.currentEpoch();
      await expect(erc20exp.connect(alice).transferAtEpoch(epoch, bob.address, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, amount);
    });

    it("[SUCCESS] transfer single large token correctly", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});

      const amount = 100;
      const expectAmount = 10;

      await expect(erc20exp.mint(alice.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);

      let epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(0);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(0);

      await expect(erc20exp.connect(alice).transferAtEpoch(epoch, bob.address, expectAmount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, expectAmount);

      expect(await erc20exp.balanceOf(alice.address)).to.equal(amount - expectAmount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(amount - expectAmount);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(expectAmount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(expectAmount);
    });

    it("[SUCCESS] transfer multiple small token correctly", async function () {
      const {erc20exp, alice, bob} = await deployERC20Selector({epochType});

      const expectBalance = iterate * amount;
      for (let index = 0; index < iterate; index++) {
        await erc20exp.mint(alice.address, amount);
      }

      let epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(0);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(expectBalance);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(expectBalance);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(0);

      await expect(erc20exp.connect(alice).transferAtEpoch(epoch, bob.address, expectBalance / 2))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, expectBalance / 2);

      expect(await erc20exp.balanceOf(alice.address)).to.equal(expectBalance / 2);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(expectBalance / 2);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(expectBalance / 2);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(expectBalance / 2);
    });
  });
};
