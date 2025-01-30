import {expect} from "chai";
import {deployERC7818ExceptionSelector} from "./deployer.test";
import {ERC7818Exception, ERC20, constants, ERC7818} from "../../../../constant.test";
import {hardhat_increasePointerTo, hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  const amount = 100;

  describe("TransferFrom", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transfer `from` non-exception `to` exception correctly", async function () {
      const {erc7818expException, deployer, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await expect(erc7818expException.addToException(alice.address))
        .to.emit(erc7818expException, ERC7818Exception.events.AddedToExceptionList)
        .withArgs(deployer.address, alice.address);
      await expect(erc7818expException.mintToException(alice.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
      await expect(erc7818expException.connect(alice).approve(bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Approval)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc7818expException.allowance(alice.address, bob.address)).to.equal(amount);
      await expect(erc7818expException.connect(bob).transferFrom(alice.address, bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, bob.address, amount);
    });

    it("[SUCCESS] transfer from at epoch `from` and `to` non-exception", async function () {
      const {erc7818expException, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await expect(erc7818expException.mint(alice.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
      await expect(erc7818expException.connect(alice).approve(bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Approval)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc7818expException.allowance(alice.address, bob.address)).to.equal(amount);
      await expect(erc7818expException.connect(bob).transferFromAtEpoch(0, alice.address, bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
    });

    it("[FAILED] transfer from at epoch with expired epoch", async function () {
      const {erc7818expException, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await expect(erc7818expException.mint(alice.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
      await expect(erc7818expException.connect(alice).approve(bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Approval)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc7818expException.allowance(alice.address, bob.address)).to.equal(amount);
      const epochLength = await erc7818expException.epochLength();
      const duration = await erc7818expException.validityDuration();
      await hardhat_increasePointerTo(epochType, epochLength * duration + epochLength);
      await expect(
        erc7818expException.connect(bob).transferFromAtEpoch(0, alice.address, bob.address, amount),
      ).to.be.revertedWithCustomError(erc7818expException, ERC7818.errors.ERC7818TransferredExpiredToken);
    });

    it("[FAILED] exception transfer at epoch `to` non-exception", async function () {
      const {erc7818expException, deployer, alice, bob} = await deployERC7818ExceptionSelector({epochType});
      await expect(erc7818expException.addToException(alice.address))
        .to.emit(erc7818expException, ERC7818Exception.events.AddedToExceptionList)
        .withArgs(deployer.address, alice.address);
      await expect(erc7818expException.mintToException(alice.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
      const epoch = await erc7818expException.currentEpoch();
      await expect(erc7818expException.connect(alice).approve(bob.address, amount))
        .to.emit(erc7818expException, ERC20.events.Approval)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc7818expException.allowance(alice.address, bob.address)).to.equal(amount);
      await expect(
        erc7818expException.connect(bob).transferFromAtEpoch(epoch, alice.address, bob.address, amount),
      ).to.be.revertedWithCustomError(erc7818expException, ERC7818Exception.errors.ExceptionAddressNotSupportTransferFromAtEpoch);
    });
  });
};
