import {expect} from "chai";
import {hardhat_reset, hardhat_skipToBlock} from "../../../utils.test";
import {deployERC20EXPBase} from "../base/deployer.test";
import {constants, ERC20} from "../../../constant.test";

export const run = async () => {
  describe("BurnFromEpoch", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] burnFromEpoch", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase();
      const epoch = await erc20exp.currentEpoch();
      await erc20exp.mint(alice.address, amount);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(amount);
      await expect(erc20exp.burnFromEpoch(epoch, alice.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
    });

    it("[SUCCESS] burn multiple large token overlap epoch correctly", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase();
      const blocksPerEpoch = await erc20exp.epochLength();

      let epoch;
      const epochs = 4;
      const amount = 10;
      for (let i = 0; i < epochs; i++) {
        await erc20exp.mint(alice.address, amount);
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

      await expect(erc20exp.connect(alice).burn(alice.address, 15))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, 15);

      expect(await erc20exp.balanceOfAtEpoch(2, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(3, alice.address)).to.equal(5);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(5);
    });

    it("[FAILED] burnFromEpoch from zero address", async function () {
      const {erc20exp} = await deployERC20EXPBase({});
      const epoch = await erc20exp.currentEpoch();
      await expect(erc20exp.burnFromEpoch(epoch, constants.ZERO_ADDRESS, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidSender)
        .withArgs(constants.ZERO_ADDRESS);
    });
  });
};
