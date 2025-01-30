import {expect} from "chai";
import {deployERC7818ExceptionSelector} from "./deployer.test";
import {ERC7818Exception, ERC20, constants} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Mint", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] mint token to `to` exception", async function () {
      const {erc7818expException, deployer, alice} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await expect(erc7818expException.mintToException(alice.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, 1);
      expect(await erc7818expException.balanceOf(alice.address)).to.equal(amount);
    });

    it("[FAILED] mint token to `to` non-exception", async function () {
      const {erc7818expException, alice} = await deployERC7818ExceptionSelector({epochType});
      await expect(erc7818expException.mintToException(alice.address, 1)).to.be.revertedWithCustomError(
        erc7818expException,
        ERC7818Exception.errors.InvalidExceptionAddress,
      );
      expect(await erc7818expException.isExceptionAddress(alice.address)).to.equal(false);
    });
  });
};
