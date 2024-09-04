import {expect} from "chai";
import {deployLightWeightERC20EXPBase} from "../../utils.test";
import {
  ERC20_INVALID_APPROVER,
  ERC20_INVALID_SPENDER,
  EVENT_APPROVAL,
  EVENT_TRANSFER,
  ZERO_ADDRESS,
} from "../../constant.test";

export const run = async () => {
  describe("Approval", async function () {
    it("[HAPPY] approve correctly", async function () {
      const {erc20exp, alice, bob} = await deployLightWeightERC20EXPBase({});

      const amount = 100;

      await expect(erc20exp.mint(await alice.getAddress(), amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, await alice.getAddress(), amount);

      await expect(erc20exp.connect(alice).approve(await bob.getAddress(), amount))
        .to.be.emit(erc20exp, EVENT_APPROVAL)
        .withArgs(await alice.getAddress(), await bob.getAddress(), amount);

      expect(await erc20exp.allowance(await alice.getAddress(), await bob.getAddress())).to.equal(amount);
    });

    it("[HAPPY] maximum allowance", async function () {
      const {erc20exp, alice, bob} = await deployLightWeightERC20EXPBase({});

      const amount = 100;

      const MAX_INT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

      await expect(erc20exp.mint(await alice.getAddress(), amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, await alice.getAddress(), amount);

      await expect(erc20exp.connect(alice).approve(await bob.getAddress(), MAX_INT))
        .to.be.emit(erc20exp, EVENT_APPROVAL)
        .withArgs(await alice.getAddress(), await bob.getAddress(), MAX_INT);

      expect(await erc20exp.allowance(await alice.getAddress(), await bob.getAddress())).to.equal(MAX_INT);
    });

    it("[UNHAPPY] invalid spender", async function () {
      const {erc20exp, alice, bob} = await deployLightWeightERC20EXPBase({});

      const amount = 100;

      await expect(erc20exp.mint(await alice.getAddress(), amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, await alice.getAddress(), amount);

      await expect(erc20exp.connect(alice).approve(ZERO_ADDRESS, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20_INVALID_SPENDER)
        .withArgs(ZERO_ADDRESS);
    });

    it("[UNHAPPY] invalid approver", async function () {
      const {erc20exp, alice} = await deployLightWeightERC20EXPBase({});

      const amount = 100;

      await expect(erc20exp.badApprove(ZERO_ADDRESS, await alice.getAddress(), amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20_INVALID_APPROVER)
        .withArgs(ZERO_ADDRESS);
    });
  });
};
