import {expect} from "chai";
import {mineBlock, skipToBlock} from "../../../utils.test";
import {deployERC20EXPBase} from "./utils.test";
import {common, ERC20} from "../../../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] mint correctly tokens into slot 0, 1 of epoch 0", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({});

      const blockPerSlot = await erc20exp.getBlocksPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const expectExp = [];

      // Ensure we are in [epoch: 0, slot 0].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      const amount = 1;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount);
      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount);
      list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  ^         ^
      //  |         |
      //  |         |
      //  |         |
      // mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 1, 2 of epoch 0", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({});

      const blockPerSlot = await erc20exp.getBlocksPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const expectExp = [];

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);

      // Ensure we are in [epoch: 0, slot 1].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      const amount = 1;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount);
      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [epoch: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 2].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(2);

      // Mint into [epoch: 0, slot 2].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount);
      list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]    *  [1]    *  [2]       [3]
      //            ^         ^
      //            |         |
      //            |         |
      //            |         |
      //           mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 2, 3 of epoch 0", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({});

      const blockPerSlot = await erc20exp.getBlocksPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const expectExp = [];

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 2].
      await mineBlock(blockPerSlot);

      // Ensure we are in [epoch: 0, slot 2].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(2);

      // Mint into [epoch: 0, slot 2].
      const amount = 1;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount);
      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [epoch: 0, slot 3].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 3].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(3);

      // Mint into [epoch: 0, slot 3].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount + amount + amount);
      list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]    *  [2]    *  [3]
      //                      ^         ^
      //                      |         |
      //                      |         |
      //                      |         |
      //                     mint      mint

      // Right now, the balance must be 4.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(4);

      // Skip to the expiry period of token 1,2.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 2.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(2);

      // Skip to the expiry period of token 3,4.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 0, 1 of epoch 0 when frame size full epoch", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({frameSize: 4, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlocksPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const expectExp = [];

      // Ensure we are in [epoch: 0, slot 0].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      const amount = 1;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount);
      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount);
      list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  ^         ^
      //  |         |
      //  |         |
      //  |         |
      // mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 1, 2 of epoch 0 when frame size full epoch", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({frameSize: 4, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlocksPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const expectExp = [];

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);

      // Ensure we are in [epoch: 0, slot 1].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      const amount = 1;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount);
      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [epoch: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 2].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(2);

      // Mint into [epoch: 0, slot 2].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount);
      list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]    *  [1]    *  [2]       [3]
      //            ^         ^
      //            |         |
      //            |         |
      //            |         |
      //           mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 2, 3 of epoch 0 when frame size full epoch", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({frameSize: 4, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlocksPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const expectExp = [];

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 2].
      await mineBlock(blockPerSlot);

      // Ensure we are in [epoch: 0, slot 2].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(2);

      // Mint into [epoch: 0, slot 2].
      const amount = 1;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount);
      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [epoch: 0, slot 3].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 3].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(3);

      // Mint into [epoch: 0, slot 3].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount + amount + amount);
      list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]    *  [2]    *  [3]
      //                      ^         ^
      //                      |         |
      //                      |         |
      //                      |         |
      //                     mint      mint

      // Right now, the balance must be 4.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(4);

      // Skip to the expiry period of token 1,2.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 2.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(2);

      // Skip to the expiry period of token 3,4.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 0, 1 of epoch 0 when frame size over epoch", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({frameSize: 6, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlocksPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const expectExp = [];

      // Ensure we are in [epoch: 0, slot 0].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      const amount = 1;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount);
      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount);
      list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  ^         ^
      //  |         |
      //  |         |
      //  |         |
      // mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 1, 2 of epoch 0 when frame size over epoch", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({frameSize: 6, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlocksPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const expectExp = [];

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);

      // Ensure we are in [epoch: 0, slot 1].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      const amount = 1;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount);
      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [epoch: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 2].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(2);

      // Mint into [epoch: 0, slot 2].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount);
      list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]    *  [1]    *  [2]       [3]
      //            ^         ^
      //            |         |
      //            |         |
      //            |         |
      //           mint      mint

      // Right now, the balance must be 2.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(2);

      // Skip to the expiry period of token 1.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 1.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(1);

      // Skip to the expiry period of token 2.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[HAPPY] mint correctly tokens into slot 2, 3 of epoch 0 when frame size over epoch", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({frameSize: 6, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlocksPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const expectExp = [];

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 2].
      await mineBlock(blockPerSlot);

      // Ensure we are in [epoch: 0, slot 2].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(2);

      // Mint into [epoch: 0, slot 2].
      const amount = 1;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount);
      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [epoch: 0, slot 3].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 3].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(3);

      // Mint into [epoch: 0, slot 3].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount + amount + amount + amount);
      list = await erc20exp.tokenList(alice.address, epoch, slot);
      expectExp.push(Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //     [0]       [1]    *  [2]    *  [3]
      //                      ^         ^
      //                      |         |
      //                      |         |
      //                      |         |
      //                     mint      mint

      // Right now, the balance must be 4.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(4);

      // Skip to the expiry period of token 1,2.
      await skipToBlock(expectExp[0]);

      // Right now, the balance must be 2.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(2);

      // Skip to the expiry period of token 3,4.
      await skipToBlock(expectExp[1]);

      // Right now, the balance must be 0.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
    });

    it("[UNHAPPY] mint to zero address", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp} = await deployERC20EXPBase({});

      expect(erc20exp["mint(address,uint256)"](common.zeroAddress, 1))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidReceiver)
        .withArgs(common.zeroAddress);
    });
  });
};
