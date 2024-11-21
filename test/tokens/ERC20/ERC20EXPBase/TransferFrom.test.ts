import {expect} from "chai";
import {deployERC20EXPBase} from "./utils.test";
import {common, ERC20} from "../../../constant.test";

export const run = async () => {
  describe("TransferFrom", async function () {
    it("[HAPPY] transfer from alice to bob correctly", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});

      const amount = 100;

      await expect(erc20exp["mint(address,uint256)"](await alice.getAddress(), amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, await alice.getAddress(), amount);

      await expect(erc20exp.connect(alice).approve(await bob.getAddress(), amount))
        .to.be.emit(erc20exp, ERC20.events.Approval)
        .withArgs(await alice.getAddress(), await bob.getAddress(), amount);

      expect(await erc20exp.allowance(await alice.getAddress(), await bob.getAddress())).to.equal(amount);

      await expect(
        erc20exp
          .connect(bob)
          ["transferFrom(address,address,uint256)"](await alice.getAddress(), await bob.getAddress(), amount),
      )
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(await alice.getAddress(), await bob.getAddress(), amount);
    });

    it("[HAPPY] alice approve maximum and transfer to bob correctly", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});

      const amount = 100;
      const MAX_INT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

      await expect(erc20exp["mint(address,uint256)"](await alice.getAddress(), amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, await alice.getAddress(), amount);

      await expect(erc20exp.connect(alice).approve(await bob.getAddress(), MAX_INT))
        .to.be.emit(erc20exp, ERC20.events.Approval)
        .withArgs(await alice.getAddress(), await bob.getAddress(), MAX_INT);

      expect(await erc20exp.allowance(await alice.getAddress(), await bob.getAddress())).to.equal(MAX_INT);

      await expect(
        erc20exp
          .connect(bob)
          ["transferFrom(address,address,uint256)"](await alice.getAddress(), await bob.getAddress(), amount),
      )
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(await alice.getAddress(), await bob.getAddress(), amount);
    });

    it("[UNHAPPY] insufficient allowance", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});

      const amount = 100;

      await expect(erc20exp["mint(address,uint256)"](await alice.getAddress(), amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, await alice.getAddress(), amount);

      await expect(erc20exp.connect(alice).approve(await bob.getAddress(), amount))
        .to.be.emit(erc20exp, ERC20.events.Approval)
        .withArgs(await alice.getAddress(), await bob.getAddress(), amount);

      expect(await erc20exp.allowance(await alice.getAddress(), await bob.getAddress())).to.equal(amount);

      await expect(
        erc20exp
          .connect(bob)
          ["transferFrom(address,address,uint256)"](await alice.getAddress(), await bob.getAddress(), amount * 2),
      )
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InsufficientAllowance)
        .withArgs(await bob.getAddress(), amount, amount * 2);
    });
  });
};
