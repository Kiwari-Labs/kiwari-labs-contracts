import {expect} from "chai";
import {common, ERC20} from "../../constant.test";
import {deployERC7818} from "./utils.test";

export const run = async () => {
  describe("Approval", async function () {
    it("[HAPPY] approve correctly", async function () {
      const {erc7818, alice, bob} = await deployERC7818({});

      const amount = 100;

      await expect(erc7818.mint(await alice.getAddress(), amount))
        .to.be.emit(erc7818, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, await alice.getAddress(), amount);

      await expect(erc7818.connect(alice).approve(await bob.getAddress(), amount))
        .to.be.emit(erc7818, ERC20.events.Approval)
        .withArgs(await alice.getAddress(), await bob.getAddress(), amount);

      expect(await erc7818.allowance(await alice.getAddress(), await bob.getAddress())).to.equal(amount);
    });

    it("[HAPPY] maximum allowance", async function () {
      const {erc7818, alice, bob} = await deployERC7818({});

      const amount = 100;

      const MAX_INT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

      await expect(erc7818.mint(await alice.getAddress(), amount))
        .to.be.emit(erc7818, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, await alice.getAddress(), amount);

      await expect(erc7818.connect(alice).approve(await bob.getAddress(), MAX_INT))
        .to.be.emit(erc7818, ERC20.events.Approval)
        .withArgs(await alice.getAddress(), await bob.getAddress(), MAX_INT);

      expect(await erc7818.allowance(await alice.getAddress(), await bob.getAddress())).to.equal(MAX_INT);
    });

    it("[UNHAPPY] invalid spender", async function () {
      const {erc7818, alice, bob} = await deployERC7818({});

      const amount = 100;

      await expect(erc7818.mint(await alice.getAddress(), amount))
        .to.be.emit(erc7818, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, await alice.getAddress(), amount);

      await expect(erc7818.connect(alice).approve(common.zeroAddress, amount))
        .to.be.revertedWithCustomError(erc7818, ERC20.errors.ERC20InvalidSpender)
        .withArgs(common.zeroAddress);
    });

    it("[UNHAPPY] invalid approver", async function () {
      const {erc7818, alice} = await deployERC7818({});

      const amount = 100;

      await expect(erc7818.badApprove(common.zeroAddress, await alice.getAddress(), amount))
        .to.be.revertedWithCustomError(erc7818, ERC20.errors.ERC20InvalidApprover)
        .withArgs(common.zeroAddress);
    });
  });
};
