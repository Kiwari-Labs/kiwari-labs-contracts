import {expect} from "chai";
import {deployERC20EXPBase} from "../base/deployer.test";
import {ERC20} from "../../../constant.test";
import {hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("TransferFromAtEpoch", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transferFromAtEpoch", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});
      const epoch = await erc20exp.currentEpoch();
      await erc20exp.mint(alice.address, amount);
      await erc20exp.connect(alice).approve(bob.address, amount);
      await expect(erc20exp.connect(bob).transferFromAtEpoch(epoch, alice.address, bob.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc20exp.balanceOf(alice.address)).to.equal(0);
      expect(await erc20exp.balanceOf(bob.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch, bob.address)).to.equal(amount);
    });
  });
};
