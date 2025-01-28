import {expect} from "chai";
import {deployERC7818WhitelistSelector} from "./deployer.test";
import {ERC20, constants, ERC7818, ERC7818Whitelist} from "../../../../constant.test";
import {hardhat_increasePointerTo, hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Transfer", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] whitelist transfer `to` non-whitelist ", async function () {
      const {erc7818expWhitelist, alice, bob, charlie} = await deployERC7818WhitelistSelector({epochType});
      const jameAddress = await charlie.getAddress();
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.mintToWhitelist(alice.address, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(amount);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(amount);
      await expect(erc7818expWhitelist.connect(bob).transfer(jameAddress, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(bob.address, jameAddress, amount);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(0);
      expect(await erc7818expWhitelist.balanceOf(jameAddress)).to.equal(amount);
    });

    it("[SUCCESS] non-whitelist transfer `to` whitelist address", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.mintToWhitelist(alice.address, amount);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, bob.address, amount);
      await expect(erc7818expWhitelist.connect(bob).transfer(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(bob.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(amount);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(0);
    });

    it("[SUCCESS] whitelist transfer `to` whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.addToWhitelist(bob.address);
      await erc7818expWhitelist.mintToWhitelist(alice.address, amount);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(amount);
    });

    it("[SUCCESS] non-whitelist transfer at epoch `to` whitelist address", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.mintToWhitelist(alice.address, amount);
      const epoch = await erc7818expWhitelist.currentEpoch();
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, bob.address, amount);
      await expect(erc7818expWhitelist.connect(bob).transferAtEpoch(epoch, alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(bob.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(amount);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(0);
    });

    it("[FAILED] whitelist transfer at epoch `to` non-whitelist ", async function () {
      const {erc7818expWhitelist, alice, bob, charlie} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.mintToWhitelist(alice.address, amount);
      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(amount);
      await expect(erc7818expWhitelist.connect(alice).transferAtEpoch(0, bob.address, amount)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.WhitelistNotSupportTransferAtEpoch,
      );
    });

    it("[FAILED] whitelist transfer at epoch `to` whitelist", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.addToWhitelist(bob.address);
      await erc7818expWhitelist.mintToWhitelist(alice.address, amount);
      const epoch = await erc7818expWhitelist.currentEpoch();

      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(amount);
      await expect(erc7818expWhitelist.connect(alice).transferAtEpoch(0, bob.address, amount)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818Whitelist.errors.WhitelistNotSupportTransferAtEpoch,
      );
    });

    it("[FAILED] non-whitelist transfer at epoch with expired epoch `to` whitelist", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818WhitelistSelector({epochType});

      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.mintToWhitelist(alice.address, amount);

      const epochLength = await erc7818expWhitelist.epochLength();
      const duration = await erc7818expWhitelist.validityDuration();

      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, bob.address, amount);

      await hardhat_increasePointerTo(epochType, epochLength * duration + epochLength);

      await expect(erc7818expWhitelist.connect(bob).transferAtEpoch(0, alice.address, amount)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC7818.errors.ERC7818TransferredExpiredToken,
      );

      expect(await erc7818expWhitelist.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818expWhitelist.balanceOf(bob.address)).to.equal(0);

      expect(await erc7818expWhitelist.balanceOfAtEpoch(0, alice.address)).to.equal(0);
      expect(await erc7818expWhitelist.balanceOfAtEpoch(0, bob.address)).to.equal(0);
    });

    it("[FAILED] whitelist transfer `to` whitelist with insufficient", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.addToWhitelist(bob.address);
      await expect(erc7818expWhitelist.connect(alice).whitelistTokenTransfer(bob.address, amount)).to.be.revertedWithCustomError(
        erc7818expWhitelist,
        ERC20.errors.ERC20InsufficientBalance,
      );
    });

    it("[FAILED] whitelist transfer `to` whitelist", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await erc7818expWhitelist.addToWhitelist(bob.address);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.be.revertedWithCustomError(erc7818expWhitelist, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, amount);
    });

    it("[FAILED] whitelist transfer `to` non-whitelist", async function () {
      const {erc7818expWhitelist, alice, bob} = await deployERC7818WhitelistSelector({epochType});
      await erc7818expWhitelist.addToWhitelist(alice.address);
      await expect(erc7818expWhitelist.connect(alice).transfer(bob.address, amount))
        .to.be.revertedWithCustomError(erc7818expWhitelist, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(alice.address, 0, amount);
    });
  });
};
