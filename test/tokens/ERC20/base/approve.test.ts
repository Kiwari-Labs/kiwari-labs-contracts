import {expect} from "chai";
import {ERC20, constants} from "../../../constant.test";
import {deployERC20EXPBase} from "./deployer.test";
import {
  hardhat_impersonate,
  hardhat_reset,
  hardhat_setBalance,
  hardhat_stopImpersonating,
  ethers,
} from "../../../utils.test";
import {parseEther} from "ethers";

export const run = async () => {
  describe("Approval", async function () {
    const amount = 100;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] approve", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase();
      await erc20exp.mint(alice.address, amount);
      await expect(erc20exp.connect(alice).approve(bob.address, amount))
        .to.emit(erc20exp, ERC20.events.Approval)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc20exp.allowance(alice.address, bob.address)).to.equal(amount);
    });

    it("[SUCCESS] approve with maximum allowance", async function () {
      const {erc20exp, alice, bob} = await deployERC20EXPBase();
      await erc20exp.mint(alice.address, amount);
      await expect(erc20exp.connect(alice).approve(bob.address, constants.MaxUint256))
        .to.emit(erc20exp, ERC20.events.Approval)
        .withArgs(alice.address, bob.address, constants.MaxUint256);
      expect(await erc20exp.allowance(alice.address, bob.address)).to.equal(constants.MaxUint256);
    });

    it("[FAILED] approve with invalid spender", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase();
      await erc20exp.mint(alice.address, amount);
      await expect(erc20exp.connect(alice).approve(constants.ZeroAddress, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidSpender)
        .withArgs(constants.ZeroAddress);
    });

    it("[FAILED] arppove with invalid approver", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase();
      await hardhat_setBalance(constants.ZeroAddress, parseEther("10000.0").toString());
      await hardhat_impersonate(constants.ZeroAddress);
      const signer = await ethers.getImpersonatedSigner(constants.ZeroAddress);
      await expect(erc20exp.connect(signer).approve(alice.address, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidApprover)
        .withArgs(constants.ZeroAddress);
      await hardhat_stopImpersonating(constants.ZeroAddress);
    });
  });
};
