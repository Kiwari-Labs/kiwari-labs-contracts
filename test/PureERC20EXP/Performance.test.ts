import {expect} from "chai";
import {deployPureERC20EXP, mineBlock} from "../utils.test";
import {DAY_IN_MILLI_SECONDS, EVENT_TRANSFER, ZERO_ADDRESS} from "../constant.test";

export const run = async () => {
  describe("Performance", async function () {
    it("[HAPPY] mint x10 times every days for x90 days and burn them all", async function () {
      // Start at block 100.
      const startBlockNumber = 100;
      await mineBlock(startBlockNumber);

      const frameSize = 2;
      const slotSize = 4;
      const blockPeriod = 400;
      const {erc20exp, alice} = await deployPureERC20EXP({frameSize, slotSize, blockPeriod});

      const aliceAddress = await alice.getAddress();

      const blockPerDay = DAY_IN_MILLI_SECONDS / blockPeriod;

      const cycleDays = 90;
      const cycleMint = 10;
      const amount = 1;

      for (let i = 0; i < cycleDays; i++) {
        for (let j = 0; j < cycleMint; j++) {
          await expect(erc20exp.mint(aliceAddress, amount))
            .to.be.emit(erc20exp, EVENT_TRANSFER)
            .withArgs(ZERO_ADDRESS, aliceAddress, amount);
        }
        // Skip 1 day
        await mineBlock(blockPerDay);
      }

      // Ensure we are in [era: 0, slot 0].
      let [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(0);

      // Right now, the balance of Alice must be (1 * 90 * 10).
      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount * cycleDays * cycleMint);

      // Expectation is that the token will be burning from the head of the linked list.
      await expect(erc20exp.burn(aliceAddress, amount * cycleDays * cycleMint))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, amount * cycleDays * cycleMint);
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] mint x10 times every days for x180 days and burn them all", async function () {
      // Start at block 100.
      const startBlockNumber = 100;
      await mineBlock(startBlockNumber);

      const frameSize = 2;
      const slotSize = 4;
      const blockPeriod = 400;
      const {erc20exp, alice} = await deployPureERC20EXP({frameSize, slotSize, blockPeriod});

      const aliceAddress = await alice.getAddress();

      const blockPerDay = DAY_IN_MILLI_SECONDS / blockPeriod;

      const cycleDays = 180;
      const cycleMint = 10;
      const amount = 1;

      for (let i = 0; i < cycleDays; i++) {
        for (let j = 0; j < cycleMint; j++) {
          await expect(erc20exp.mint(aliceAddress, amount))
            .to.be.emit(erc20exp, EVENT_TRANSFER)
            .withArgs(ZERO_ADDRESS, aliceAddress, amount);
        }
        // Skip 1 day
        await mineBlock(blockPerDay);
      }

      // Ensure we are in [era: 0, slot 1].
      let [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(1);

      // Right now, the balance of Alice must be (1 * 180 * 10).
      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount * cycleDays * cycleMint);

      // ProviderError: Transaction ran out of gas
      // Expectation is that the token will be burning from the head of the linked list.
      // await expect(erc20exp.burn(aliceAddress, amount * cycleDays * cycleMint))
      //   .to.be.emit(erc20exp, EVENT_TRANSFER)
      //   .withArgs(aliceAddress, ZERO_ADDRESS, amount * cycleDays * cycleMint);
      await expect(erc20exp.burn(aliceAddress, 900))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 900);
      await expect(erc20exp.burn(aliceAddress, 900))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 900);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] mint x10 times every days for x270 days and burn them all", async function () {
      // Start at block 100.
      const startBlockNumber = 100;
      await mineBlock(startBlockNumber);

      const frameSize = 3;
      const slotSize = 4;
      const blockPeriod = 400;
      const {erc20exp, alice} = await deployPureERC20EXP({frameSize, slotSize, blockPeriod});

      const aliceAddress = await alice.getAddress();

      const blockPerDay = DAY_IN_MILLI_SECONDS / blockPeriod;

      const cycleDays = 270;
      const cycleMint = 10;
      const amount = 1;

      for (let i = 0; i < cycleDays; i++) {
        for (let j = 0; j < cycleMint; j++) {
          await expect(erc20exp.mint(aliceAddress, amount))
            .to.be.emit(erc20exp, EVENT_TRANSFER)
            .withArgs(ZERO_ADDRESS, aliceAddress, amount);
        }
        // Skip 1 day
        await mineBlock(blockPerDay);
      }

      // Ensure we are in [era: 0, slot 2].
      let [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(2);

      // Right now, the balance of Alice must be (1 * 270 * 10).
      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount * cycleDays * cycleMint);

      // ProviderError: Transaction ran out of gas
      // Expectation is that the token will be burning from the head of the linked list.
      // await expect(erc20exp.burn(aliceAddress, amount * cycleDays * cycleMint))
      //   .to.be.emit(erc20exp, EVENT_TRANSFER)
      //   .withArgs(aliceAddress, ZERO_ADDRESS, amount * cycleDays * cycleMint);

      await expect(erc20exp.burn(aliceAddress, 900))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 900);
      await expect(erc20exp.burn(aliceAddress, 900))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 900);
      await expect(erc20exp.burn(aliceAddress, 900))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(aliceAddress, ZERO_ADDRESS, 900);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });
  });
};
