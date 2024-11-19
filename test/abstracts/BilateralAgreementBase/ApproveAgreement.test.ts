import {expect} from "chai";
import {AbiCoder} from "@ethersproject/abi";
import {deployERC20EXPBase} from "../../tokens/ERC20/ERC20EXPBase/utils.test";
import {deployAgreementBaseForBilateral, deployBilateralAgreementBase} from "./utils.test";
import {AgreementBase} from "../../constant.test";

export const run = async () => {
  describe("ApproveAgreement", async function () {
    let abiCoder = new AbiCoder();

    it("[HAPPY] bilateral agreement implementation", async function () {
      const blockPeriod = 400;
      const amount = 1000n;

      const {agreementBase, alice, bob} = await deployAgreementBaseForBilateral(AgreementBase.name);
      const {bilateralAgreementBase} = await deployBilateralAgreementBase(
        [await alice.getAddress(), await bob.getAddress()],
        agreementBase.address,
      );
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();

      const tokenA = (await deployERC20EXPBase({blockPeriod})).erc20exp;
      const tokenB = (await deployERC20EXPBase({blockPeriod})).erc20exp;

      await tokenA.mint(aliceAddress, amount);
      await tokenB.mint(bobAddress, amount);

      await tokenA.connect(alice).approve(bilateralAgreementBase.address, amount);
      await tokenB.connect(bob).approve(bilateralAgreementBase.address, amount);

      await bilateralAgreementBase
        .connect(alice)
        .approveAgreement(abiCoder.encode(["address", "uint256"], [tokenA.address, amount]));
      await bilateralAgreementBase
        .connect(bob)
        .approveAgreement(abiCoder.encode(["address", "uint256"], [tokenB.address, amount]));
      expect(await tokenA["balanceOf(address)"](bobAddress)).to.equal(amount);
      expect(await tokenB["balanceOf(address)"](aliceAddress)).to.equal(amount);
      expect((await bilateralAgreementBase.transaction(1)).executed).to.equal(true);
      expect(await bilateralAgreementBase.transactionLength()).to.equal(1);
    });
  });
};
