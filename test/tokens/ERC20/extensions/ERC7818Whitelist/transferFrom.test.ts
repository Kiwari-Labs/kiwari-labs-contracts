import {expect} from "chai";
import {deployERC7818WhitelistSelector} from "./deployer.test";
import {ERC7818Whitelist, ERC20, constants} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("TransferFrom", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transfer from alice to bob correctly", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818WhitelistSelector({epochType});
      const amount = 100;
      await expect(erc7818expWhitelist.addToWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.Whitelisted)
        .withArgs(deployer.address, alice.address);
      await expect(erc7818expWhitelist.mintToWhitelist(alice.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, alice.address, amount);
      await expect(erc7818expWhitelist.connect(alice).approve(bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Approval)
        .withArgs(alice.address, bob.address, amount);
      expect(await erc7818expWhitelist.allowance(alice.address, bob.address)).to.equal(amount);
      await expect(erc7818expWhitelist.connect(bob).transferFrom(alice.address, bob.address, amount))
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, constants.ZERO_ADDRESS, amount)
        .to.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(constants.ZERO_ADDRESS, bob.address, amount);
    });
  });
};
