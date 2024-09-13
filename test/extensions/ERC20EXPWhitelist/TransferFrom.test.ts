import {expect} from "chai";
import {deployERC20EXPWhitelist} from "../../utils.test";
import {EVENT_APPROVAL, EVENT_TRANSFER, EVENT_WHITELIST_GRANTED, ZERO_ADDRESS} from "../../constant.test";

export const run = async () => {
  describe("TransferFrom", async function () {
    it("[HAPPY] transfer from alice to bob correctly", async function () {
      const {erc20exp, deployer, alice, bob} = await deployERC20EXPWhitelist();
      const deployerAddress = await deployer.getAddress();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const amount = 100;
      await expect(erc20exp.grantWhitelist(aliceAddress))
        .to.emit(erc20exp, EVENT_WHITELIST_GRANTED)
        .withArgs(deployerAddress, aliceAddress);
      await expect(erc20exp.mintSpendableWhitelist(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      await expect(erc20exp.connect(alice).approve(bobAddress, amount))
        .to.be.emit(erc20exp, EVENT_APPROVAL)
        .withArgs(aliceAddress, bobAddress, amount);

      expect(await erc20exp.allowance(aliceAddress, bobAddress)).to.equal(amount);

      await expect(erc20exp.connect(bob).transferFrom(aliceAddress, bobAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, amount)
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, bobAddress, amount);
    });
  });
};
