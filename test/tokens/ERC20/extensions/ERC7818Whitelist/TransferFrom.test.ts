import {expect} from "chai";
import {deployERC7818Whitelist} from "./utils.test";
import {common, ERC7818Whitelist, ERC20} from "../../../../constant.test";

export const run = async () => {
  describe("TransferFrom", async function () {
    it("[HAPPY] transfer from alice to bob correctly", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      const deployerAddress = await deployer.getAddress();

      const amount = 100;
      await expect(erc7818expWhitelist.grantWhitelist(alice.address))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, alice.address);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(alice.address, amount))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      await expect(erc7818expWhitelist.connect(alice).approve(bob.address, amount))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Approval)
        .withArgs(alice.address, bob.address, amount);

      expect(await erc7818expWhitelist.allowance(alice.address, bob.address)).to.equal(amount);

      await expect(
        erc7818expWhitelist.connect(bob)["transferFrom(address,address,uint256)"](alice.address, bob.address, amount),
      )
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(alice.address, common.zeroAddress, amount)
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);
    });
  });
};
