import {expect} from "chai";
import {deployERC7818Whitelist} from "./utils.test";
import {common, ERC7818Whitelist, ERC20} from "../../../../constant.test";

export const run = async () => {
  describe("TransferFrom", async function () {
    it("[HAPPY] transfer from alice to bob correctly", async function () {
      const {erc7818expWhitelist, deployer, alice, bob} = await deployERC7818Whitelist();
      const deployerAddress = await deployer.getAddress();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const amount = 100;
      await expect(erc7818expWhitelist.grantWhitelist(aliceAddress))
        .to.emit(erc7818expWhitelist, ERC7818Whitelist.events.WhitelistGranted)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc7818expWhitelist.mintSpendableWhitelist(aliceAddress, amount))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, amount);

      await expect(erc7818expWhitelist.connect(alice).approve(bobAddress, amount))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Approval)
        .withArgs(aliceAddress, bobAddress, amount);

      expect(await erc7818expWhitelist.allowance(aliceAddress, bobAddress)).to.equal(amount);

      await expect(erc7818expWhitelist.connect(bob).transferFrom(aliceAddress, bobAddress, amount))
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(aliceAddress, common.zeroAddress, amount)
        .to.be.emit(erc7818expWhitelist, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bobAddress, amount);
    });
  });
};
