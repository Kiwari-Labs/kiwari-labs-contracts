import {expect} from "chai";
import {hardhat_latestBlock, hardhat_reset} from "../../../utils.test";
import {deployERC20EXPBase} from "./deployer.test";
import {ERC20, constants} from "../../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mint", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      await expect(erc20exp.mint(alice.address, amount))
        .to.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(constants.ZeroAddress, alice.address, amount);

      const epoch = await erc20exp.currentEpoch();
      const latestBlock = await hardhat_latestBlock();
      expect(await erc20exp.balanceOf(alice.address)).to.equal(amount);
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(amount);
      /* additional function */
      expect(await erc20exp.getWorldStateBalance(latestBlock));
      const list = await erc20exp.tokenList(alice.address, epoch);
      expect(list.length).to.equal(1);
      expect(list[0]).to.equal(latestBlock);
    });

    it("[FAILED] mint to zero address", async function () {
      const {erc20exp} = await deployERC20EXPBase({});
      await expect(erc20exp.mint(constants.ZeroAddress, amount))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidReceiver)
        .withArgs(constants.ZeroAddress);
    });
  });
};
