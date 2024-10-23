import {expect} from "chai";
import {deployLightWeightERC20EXPBase, mineBlock, skipToBlock} from "../../utils.test";
import {ERROR_ERC20_INVALID_RECEIVER, EVENT_TRANSFER, ZERO_ADDRESS} from "../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] mint correctly tokens into slot 0, 1 of era 0", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployLightWeightERC20EXPBase({});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceAddress = await alice.getAddress();

      const expectExp = [];

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
      expectExp.push(Number(list[0]) + blockPerFrame);
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
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  ^         ^
      //  |         |
      //  |         |
      //  |         |
      // mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 1, 2 of era 0", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployLightWeightERC20EXPBase({});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceAddress = await alice.getAddress();

      const expectExp = [];

      // Skip to [era: 0, slot 1].
      await mineBlock(blockPerSlot);

      // Ensure we are in [era: 0, slot 1].
      let [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(1);

      // Mint into [era: 0, slot 1].
      const amount = 1;
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount);
      let list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [era: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Ensure we are in [era: 0, slot 2].
      [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(2);

      // Mint into [era: 0, slot 2].
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount + amount);
      list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]    *  [1]    *  [2]       [3]
      //            ^         ^
      //            |         |
      //            |         |
      //            |         |
      //           mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 2, 3 of era 0", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployLightWeightERC20EXPBase({});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceAddress = await alice.getAddress();

      const expectExp = [];

      // Skip to [era: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Skip to [era: 0, slot 2].
      await mineBlock(blockPerSlot);

      // Ensure we are in [era: 0, slot 2].
      let [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(2);

      // Mint into [era: 0, slot 2].
      const amount = 1;
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount + amount);
      let list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [era: 0, slot 3].
      await mineBlock(blockPerSlot);
      // Ensure we are in [era: 0, slot 3].
      [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(3);

      // Mint into [era: 0, slot 3].
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount + amount + amount + amount);
      list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]    *  [2]    *  [3]
      //                      ^         ^
      //                      |         |
      //                      |         |
      //                      |         |
      //                     mint      mint

      // Right now, the balance must be 4.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(4);

      // Skip to the expiry period of token 1,2.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 2.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(2);

      // Skip to the expiry period of token 3,4.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 0, 1 of era 0 when frame size full era", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployLightWeightERC20EXPBase({frameSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceAddress = await alice.getAddress();

      const expectExp = [];

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
      expectExp.push(Number(list[0]) + blockPerFrame);
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
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  ^         ^
      //  |         |
      //  |         |
      //  |         |
      // mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 1, 2 of era 0 when frame size full era", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployLightWeightERC20EXPBase({frameSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceAddress = await alice.getAddress();

      const expectExp = [];

      // Skip to [era: 0, slot 1].
      await mineBlock(blockPerSlot);

      // Ensure we are in [era: 0, slot 1].
      let [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(1);

      // Mint into [era: 0, slot 1].
      const amount = 1;
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount);
      let list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [era: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Ensure we are in [era: 0, slot 2].
      [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(2);

      // Mint into [era: 0, slot 2].
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount + amount);
      list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]    *  [1]    *  [2]       [3]
      //            ^         ^
      //            |         |
      //            |         |
      //            |         |
      //           mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 2, 3 of era 0 when frame size full era", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployLightWeightERC20EXPBase({frameSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceAddress = await alice.getAddress();

      const expectExp = [];

      // Skip to [era: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Skip to [era: 0, slot 2].
      await mineBlock(blockPerSlot);

      // Ensure we are in [era: 0, slot 2].
      let [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(2);

      // Mint into [era: 0, slot 2].
      const amount = 1;
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount + amount);
      let list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [era: 0, slot 3].
      await mineBlock(blockPerSlot);
      // Ensure we are in [era: 0, slot 3].
      [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(3);

      // Mint into [era: 0, slot 3].
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount + amount + amount + amount);
      list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]    *  [2]    *  [3]
      //                      ^         ^
      //                      |         |
      //                      |         |
      //                      |         |
      //                     mint      mint

      // Right now, the balance must be 4.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(4);

      // Skip to the expiry period of token 1,2.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 2.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(2);

      // Skip to the expiry period of token 3,4.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 0, 1 of era 0 when frame size over era", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployLightWeightERC20EXPBase({frameSize: 6});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceAddress = await alice.getAddress();

      const expectExp = [];

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
      expectExp.push(Number(list[0]) + blockPerFrame);
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
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  ^         ^
      //  |         |
      //  |         |
      //  |         |
      // mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 1, 2 of era 0 when frame size over era", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployLightWeightERC20EXPBase({frameSize: 6});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceAddress = await alice.getAddress();

      const expectExp = [];

      // Skip to [era: 0, slot 1].
      await mineBlock(blockPerSlot);

      // Ensure we are in [era: 0, slot 1].
      let [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(1);

      // Mint into [era: 0, slot 1].
      const amount = 1;
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount);
      let list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [era: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Ensure we are in [era: 0, slot 2].
      [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(2);

      // Mint into [era: 0, slot 2].
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount + amount);
      list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]    *  [1]    *  [2]       [3]
      //            ^         ^
      //            |         |
      //            |         |
      //            |         |
      //           mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 2, 3 of era 0 when frame size over era", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployLightWeightERC20EXPBase({frameSize: 6});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceAddress = await alice.getAddress();

      const expectExp = [];

      // Skip to [era: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Skip to [era: 0, slot 2].
      await mineBlock(blockPerSlot);

      // Ensure we are in [era: 0, slot 2].
      let [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(2);

      // Mint into [era: 0, slot 2].
      const amount = 1;
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount + amount);
      let list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [era: 0, slot 3].
      await mineBlock(blockPerSlot);
      // Ensure we are in [era: 0, slot 3].
      [era, slot] = await erc20exp.currentEraAndSlot();
      expect(era).equal(0);
      expect(slot).equal(3);

      // Mint into [era: 0, slot 3].
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);

      expect(await erc20exp.balanceOf(aliceAddress)).equal(amount + amount + amount + amount);
      list = await erc20exp.tokenList(aliceAddress, era, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- era 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]    *  [2]    *  [3]
      //                      ^         ^
      //                      |         |
      //                      |         |
      //                      |         |
      //                     mint      mint

      // Right now, the balance must be 4.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(4);

      // Skip to the expiry period of token 1,2.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 2.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(2);

      // Skip to the expiry period of token 3,4.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp.balanceOf(aliceAddress)).equal(0);
    });

    it("[UNHAPPY] mint to zero address", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp} = await deployLightWeightERC20EXPBase({});

      expect(erc20exp.mint(ZERO_ADDRESS, 1))
        .to.be.revertedWithCustomError(erc20exp, ERROR_ERC20_INVALID_RECEIVER)
        .withArgs(ZERO_ADDRESS);
    });
  });
};
