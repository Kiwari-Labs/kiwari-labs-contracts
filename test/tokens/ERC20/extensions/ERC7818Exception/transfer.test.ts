import {expect} from "chai";
import {deployERC7818ExceptionSelector} from "./deployer.test";
import {ERC20, constants, ERC7818, ERC7818Exception} from "../../../../constant.test";
import {hardhat_increasePointerTo, hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Transfer", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] exception transfer `to` non-exception ", async function () {
      const {erc7818expException, alice, bob, charlie} = await deployERC7818ExceptionSelector({epochType});
      const jameAddress = await charlie.getAddress();
      await erc7818expException.addToException(alice.address);
      await erc7818expException.mintToException(alice.address, amount);
      expect(await erc7818expException.balanceOf(alice.address)).to.equal(amount);
      await expect(erc7818expException.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount);
      expect(await erc7818expException.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818expException.balanceOf(bob.address)).to.equal(amount);
      await expect(erc7818expException.connect(bob).transfer(jameAddress, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(bob.address, jameAddress, amount);
      expect(await erc7818expException.balanceOf(bob.address)).to.equal(0);
      expect(await erc7818expException.balanceOf(jameAddress)).to.equal(amount);
    });

    it("[SUCCESS] non-exception transfer `to` exception address", async function () {
      const {erc7818expException, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await erc7818expException.mintToException(alice.address, amount);
      await expect(erc7818expException.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, bob.address, amount);
      await expect(erc7818expException.connect(bob).transfer(alice.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(bob.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
      expect(await erc7818expException.balanceOf(alice.address)).to.equal(amount);
      expect(await erc7818expException.balanceOf(bob.address)).to.equal(0);
    });

    it("[SUCCESS] exception transfer `to` exception", async function () {
      const {erc7818expException, deployer, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await erc7818expException.addToException(bob.address);
      await erc7818expException.mintToException(alice.address, amount);
      await expect(erc7818expException.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc7818expException.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818expException.balanceOf(bob.address)).to.equal(amount);
    });

    it("[SUCCESS] non-exception transfer at epoch `to` exception address", async function () {
      const {erc7818expException, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await erc7818expException.mintToException(alice.address, amount);
      const epoch = await erc7818expException.currentEpoch();
      await expect(erc7818expException.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, bob.address, amount);
      await expect(erc7818expException.connect(bob).transferAtEpoch(epoch, alice.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(bob.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
      expect(await erc7818expException.balanceOf(alice.address)).to.equal(amount);
      expect(await erc7818expException.balanceOf(bob.address)).to.equal(0);
    });

    it("[FAILED] exception transfer at epoch `to` non-exception ", async function () {
      const {erc7818expException, alice, bob, charlie} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await erc7818expException.mintToException(alice.address, amount);
      expect(await erc7818expException.balanceOf(alice.address)).to.equal(amount);
      await expect(erc7818expException.connect(alice).transferAtEpoch(0, bob.address, amount)).to.be.revertedWithCustomError(
        erc7818expException,
        ERC7818Exception.errors.ExceptionAddressNotSupportTransferAtEpoch,
      );
    });

    it("[FAILED] exception transfer at epoch `to` exception", async function () {
      const {erc7818expException, deployer, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await erc7818expException.addToException(bob.address);
      await erc7818expException.mintToException(alice.address, amount);
      const epoch = await erc7818expException.currentEpoch();

      expect(await erc7818expException.balanceOf(alice.address)).to.equal(amount);
      await expect(erc7818expException.connect(alice).transferAtEpoch(0, bob.address, amount)).to.be.revertedWithCustomError(
        erc7818expException,
        ERC7818Exception.errors.ExceptionAddressNotSupportTransferAtEpoch,
      );
    });

    it("[FAILED] non-exception transfer at epoch with expired epoch `to` exception", async function () {
      const {erc7818expException, alice, bob} = await deployERC7818ExceptionSelector({epochType});

      await erc7818expException.addToException(alice.address);
      await erc7818expException.mintToException(alice.address, amount);

      const epochLength = await erc7818expException.epochLength();
      const duration = await erc7818expException.validityDuration();

      await expect(erc7818expException.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, bob.address, amount);

      await hardhat_increasePointerTo(epochType, epochLength * duration + epochLength);

      await expect(erc7818expException.connect(bob).transferAtEpoch(0, alice.address, amount)).to.be.revertedWithCustomError(
        erc7818expException,
        ERC7818.errors.ERC7818TransferredExpiredToken,
      );

      expect(await erc7818expException.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818expException.balanceOf(bob.address)).to.equal(0);

      expect(await erc7818expException.balanceOfAtEpoch(0, alice.address)).to.equal(0);
      expect(await erc7818expException.balanceOfAtEpoch(0, bob.address)).to.equal(0);
    });

    it("[FAILED] exception transfer `to` exception with insufficient", async function () {
      const {erc7818expException, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await erc7818expException.addToException(bob.address);
      await expect(erc7818expException.connect(alice).exceptionTokenTransfer(bob.address, amount)).to.be.revertedWithCustomError(
        erc7818expException,
        ERC20.errors.ERC20InsufficientBalance,
      );
    });

    it("[FAILED] exception transfer `to` exception", async function () {
      const {erc7818expException, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await erc7818expException.addToException(bob.address);
      await expect(erc7818expException.connect(alice).transfer(bob.address, amount))
        .to.be.revertedWithCustomError(erc7818expException, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, amount);
    });

    it("[FAILED] exception transfer `to` non-exception", async function () {
      const {erc7818expException, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await expect(erc7818expException.connect(alice).transfer(bob.address, amount))
        .to.be.revertedWithCustomError(erc7818expException, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, amount);
    });
  });
};
