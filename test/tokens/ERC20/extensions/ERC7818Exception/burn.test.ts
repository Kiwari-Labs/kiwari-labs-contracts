import {expect} from "chai";
import {deployERC7818ExceptionSelector} from "./deployer.test";
import {ERC7818Exception, ERC20, constants} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Burn", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] burnSpendableException `to` exception", async function () {
      const {erc7818expException, deployer, alice} = await deployERC7818ExceptionSelector({epochType});
      await expect(erc7818expException.addToException(alice.address))
        .to.emit(erc7818expException, ERC7818Exception.events.AddedToExceptionList)
        .withArgs(deployer.address, alice.address);
      await expect(erc7818expException.mintToException(alice.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
      await expect(erc7818expException.burnFromException(alice.address, amount))
        .to.emit(erc7818expException, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount);
      expect(await erc7818expException.balanceOf(alice.address)).to.equal(0);
    });

    it("[FAILED] cannot burn cause insufficient balance of exception", async function () {
      const {erc7818expException, deployer, alice} = await deployERC7818ExceptionSelector({epochType});
      await expect(erc7818expException.addToException(alice.address))
        .to.emit(erc7818expException, ERC7818Exception.events.AddedToExceptionList)
        .withArgs(deployer.address, alice.address);
      await expect(erc7818expException.burnFromException(alice.address, amount)).to.be.revertedWithCustomError(
        erc7818expException,
        ERC20.errors.ERC20InsufficientBalance,
      );
    });

    it("[FAILED] burn token from `to` non-exception", async function () {
      const {erc7818expException, alice} = await deployERC7818ExceptionSelector({epochType});
      await expect(erc7818expException.burnFromException(alice.address, amount)).to.be.revertedWithCustomError(
        erc7818expException,
        ERC7818Exception.errors.InvalidExceptionAddress,
      );
    });
  });
};
