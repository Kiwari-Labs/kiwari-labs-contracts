import {expect} from "chai";
import {deployERC7818ExceptionSelector} from "./deployer.test";
import {constants, ERC7818Exception} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("AddToException", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] addToException", async function () {
      const {erc7818expException, deployer, alice} = await deployERC7818ExceptionSelector({epochType});
      await expect(erc7818expException.addToException(alice.address))
        .to.emit(erc7818expException, ERC7818Exception.events.AddedToExceptionList)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818expException.isExceptionAddress(alice.address)).to.equal(true);
    });

    it("[FAILED] addToException with exception", async function () {
      const {erc7818expException, deployer, alice} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await expect(erc7818expException.addToException(alice.address)).to.be.revertedWithCustomError(
        erc7818expException,
        ERC7818Exception.errors.ExistInExceptionList,
      );
    });
  });
};
