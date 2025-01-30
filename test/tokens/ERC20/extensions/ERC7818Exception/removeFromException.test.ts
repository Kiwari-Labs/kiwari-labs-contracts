import {expect} from "chai";
import {deployERC7818ExceptionSelector} from "./deployer.test";
import {constants, ERC7818Exception} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("RemoveFromException", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] removeFromException", async function () {
      const {erc7818expException, deployer, alice} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await expect(erc7818expException.removeFromException(alice.address))
        .to.emit(erc7818expException, ERC7818Exception.events.RemovedFromExceptionList)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818expException.isExceptionAddress(alice.address)).to.equal(false);
    });

    it("[SUCCESS] removeFromException can clean exception balance", async function () {
      const {erc7818expException, deployer, alice} = await deployERC7818ExceptionSelector({epochType});
      await erc7818expException.addToException(alice.address);
      await erc7818expException.mintToException(alice.address, 2);
      expect(await erc7818expException.balanceOf(alice.address)).to.equal(2);
      await expect(erc7818expException.removeFromException(alice.address))
        .to.emit(erc7818expException, ERC7818Exception.events.RemovedFromExceptionList)
        .withArgs(deployer.address, alice.address);
      expect(await erc7818expException.isExceptionAddress(alice.address)).to.equal(false);
      expect(await erc7818expException.balanceOf(alice.address)).to.equal(0);
    });

    it("[FAILED] removeFromException with non-exception", async function () {
      const {erc7818expException, alice} = await deployERC7818ExceptionSelector({epochType});
      await expect(erc7818expException.removeFromException(alice.address)).to.be.revertedWithCustomError(
        erc7818expException,
        ERC7818Exception.errors.NotExistInExceptionList,
      );
    });
  });
};
