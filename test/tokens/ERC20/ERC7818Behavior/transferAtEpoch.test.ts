import {expect} from "chai";
import {deployERC20EXPBase} from "../base/deployer.test";
import {ERC20, ERC7818, constants} from "../../../constant.test";
import {
  ethers,
  hardhat_impersonate,
  hardhat_mine,
  hardhat_reset,
  hardhat_setBalance,
  hardhat_stopImpersonating,
  hardhat_skipToBlock,
} from "../../../utils.test";

export const run = async () => {
  describe("TransferAtEpoch", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
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

    it("[FAILED] transferAtEpoch with invalid sender", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});

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
      const {erc20exp, alice} = await deployERC20EXPBase({});
      const epoch = await erc20exp.currentEpoch();
      await expect(erc20exp.connect(alice).transferAtEpoch(epoch, constants.ZERO_ADDRESS, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidReceiver)
        .withArgs(constants.ZERO_ADDRESS);
    });

    it("[FAILED] transferAtEpoch with expired epoch", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});
      await erc20exp.mint(alice.address, amount);

      const epochLength = await erc20exp.epochLength();
      const duration = await erc20exp.validityDuration();

      await hardhat_mine(epochLength * duration + epochLength);

      await expect(erc20exp.connect(alice).transferAtEpoch(0, bob.address, amount)).to.be.revertedWithCustomError(
        erc20exp,
        ERC7818.errors.ERC7818TransferredExpiredToken,
      );

      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);

      expect(await erc20exp.balanceOfAtEpoch(0, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(0, bob.address)).to.equal(0);
    });

    it("[SUCCESS] transfer single large token correctly", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase();
      const blocksPerEpoch = await erc20exp.epochLength();
      const blocksPerWindow = (await erc20exp.validityDuration()) * blocksPerEpoch;

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

      await expect(erc20exp.connect(alice).transfer(bob.address, expectAmount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, expectAmount);

      expect(await erc20exp.balanceOf(alice.address)).to.equal(amount - expectAmount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(amount - expectAmount);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(expectAmount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(expectAmount);

      await hardhat_skipToBlock(Number(blocksPerWindow) + 3);

      epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(2);

      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(0);
    });

    it("[SUCCESS] transfer multiple small token correctly", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase();
      const blocksPerEpoch = await erc20exp.epochLength();
      const blocksPerWindow = (await erc20exp.validityDuration()) * blocksPerEpoch;

      const amount = 1;
      const iterate = 10;
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

      await expect(erc20exp.connect(alice).transfer(bob.address, expectBalance / 2))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, expectBalance / 2);

      expect(await erc20exp.balanceOf(alice.address)).to.equal(expectBalance / 2);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(expectBalance / 2);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(expectBalance / 2);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(expectBalance / 2);

      await hardhat_skipToBlock(Number(blocksPerWindow) + iterate + 2);
      epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(2);

      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(0);
    });

    it("[SUCCESS] transfer multiple small token overlap epoch correctly", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase();
      const blocksPerEpoch = await erc20exp.epochLength();
      const blocksPerWindow = (await erc20exp.validityDuration()) * blocksPerEpoch;

      let epoch;
      const epochs = 4;
      const amount = 1;
      const iterate = 10;
      for (let i = 0; i < epochs; i++) {
        for (let j = 0; j < iterate; j++) {
          await erc20exp.mint(alice.address, amount);
        }
        epoch = await erc20exp.currentEpoch();
        expect(epoch).to.equal(i);
        if (epoch > 1) {
          expect(await erc20exp.balanceOf(alice.address)).to.equal(20);
        }
        if (epochs - (i + 1) > 0) {
          await hardhat_skipToBlock(Number(blocksPerEpoch) * (i + 1) + 1);
        }
      }

      epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(3);

      expect(await erc20exp.balanceOfAtEpoch(0, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(1, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(2, alice.address)).to.equal(10);
      expect(await erc20exp.balanceOfAtEpoch(3, alice.address)).to.equal(10);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(20);

      await expect(erc20exp.connect(alice).transfer(bob.address, 15))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 15);

      expect(await erc20exp.balanceOfAtEpoch(2, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(3, alice.address)).to.equal(5);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(5);
      expect(await erc20exp.balanceOfAtEpoch(2, bob.address)).to.equal(10);
      expect(await erc20exp.balanceOfAtEpoch(3, bob.address)).to.equal(5);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(15);

      let [balance, expiry] = await erc20exp.getNearestExpiryOf(alice.address);
      expect(balance).to.equal(1);
      expect(expiry).to.equal(Number(blocksPerEpoch) * 3 + Number(blocksPerWindow) + 5 + 2);

      [balance, expiry] = await erc20exp.getNearestExpiryOf(bob.address);
      expect(balance).to.equal(1);
      expect(expiry).to.equal(Number(blocksPerEpoch) * 3 + Number(blocksPerWindow) + 2);

      await hardhat_skipToBlock(Number(blocksPerEpoch) * 5 + 1);
      epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(epochs + 1);

      expect(await erc20exp.balanceOfAtEpoch(epochs - 2, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epochs - 1, alice.address)).to.equal(5);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(5);
      expect(await erc20exp.balanceOfAtEpoch(epochs - 2, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epochs - 1, alice.address)).to.equal(5);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(5);

      await hardhat_skipToBlock(Number(blocksPerEpoch) * 6 + 1);

      epoch = await erc20exp.currentEpoch();
      expect(epoch).to.equal(epochs + 2);

      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(0);
    });
  });
};
