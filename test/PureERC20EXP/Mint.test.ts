import {expect} from "chai";
import {deployPureERC20EXP, latestBlock, mineBlock, skipToBlock} from "../utils.test";
import {EVENT_TRANSFER, ZERO_ADDRESS} from "../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployPureERC20EXP();

      const blockPerSlot = await erc20exp.blockPerSlot();

      const aliceAddress = await alice.getAddress();

      // Ensure we are in [era: 0, slot 0].
      let [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(0);

      // Mint into [era: 0, slot 0].
      const amount = 1;
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount);
      let list = await erc20exp.tokenList(aliceAddress, era, slot);
      expect(list.length).equal(1);

      // Skip to [era: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Ensure we are in [era: 0, slot 1].
      [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(1);

      // Mint into [era: 0, slot 1].
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount + amount);
      list = await erc20exp.tokenList(aliceAddress, era, slot);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]       [2]       [3]
      //      ^         ^
      //      |         |
      //      |         |
      //      *         *
      //     mint     mint

      // With a frame size of 4, slot 1 in era 0, the balance must be 2.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(2);

      // Skip to [era: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Ensure we are in [era: 0, slot 2].
      [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(2);

      // Skip to [era: 0, slot 3].
      await mineBlock(blockPerSlot);
      // Ensure we are in [era: 0, slot 3].
      [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(3);

      // Skip to [era: 1, slot 0].
      await mineBlock(blockPerSlot);
      // Ensure we are in [era: 0, slot 3].
      [era, slot] = await erc20exp.currentEraAndSlot();
      console.log(era, slot);
      expect(era).equal(1);
      expect(slot).equal(0);
    });

    // it("[UNHAPPY] mint to zero address", async function () {
    //   // TODO: add test case (suitable logic and event response).
    // });
  });
};
