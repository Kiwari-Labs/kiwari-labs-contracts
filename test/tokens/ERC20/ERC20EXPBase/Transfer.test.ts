import {expect} from "chai";
import {mineBlock, skipToBlock} from "../../../utils.test";
import {deployERC20EXPBase} from "./utils.test";
import {common, ERC20} from "../../../constant.test";

export const run = async () => {
  describe("Transfer", async function () {
    it("[HAPPY] transfer correctly if frame size is 2 and slot per epoch is 4", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice, bob} = await deployERC20EXPBase({frameSize: 2, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceExpectExp = [];
      const bobExpectExp = [];

      // Ensure we are in [epoch: 0, slot 0].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      const amount = 10;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      aliceExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      list = await erc20exp.tokenList(bob.address, epoch, slot);
      bobExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice     Bob
      //  10, 10    10, 10

      // Right now, the balance of Alice and Bob must be 20.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount * 2);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(amount * 2);

      // Transfer 5 token from Alice to Bob.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice --> Bob
      //  5, 10     5, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(15);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[0]);

      // Right now, the balance of
      // Alice must be 10.
      // Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(10);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Transfer 5 tokens from Alice to Bob, repeating this process twice.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice --> Bob
      //  0, 5      0, 5, 10, 10
      //  0, 0      0, 10, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(5);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(30);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[1]);

      // Right now, the balance of Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[0]);

      // Right now, the balance of Bob must be 10.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(10);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[1]);

      // Right now, the balance of Bob must be 0.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(0);
    });

    it("[HAPPY] transfer correctly if frame size is 4 and slot per epoch is 4", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice, bob} = await deployERC20EXPBase({frameSize: 4, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceExpectExp = [];
      const bobExpectExp = [];

      // Ensure we are in [epoch: 0, slot 0].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      const amount = 10;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      aliceExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      list = await erc20exp.tokenList(bob.address, epoch, slot);
      bobExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice     Bob
      //  10, 10    10, 10

      // Right now, the balance of Alice and Bob must be 20.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount * 2);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(amount * 2);

      // Transfer 5 token from Alice to Bob.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice --> Bob
      //  5, 10     5, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(15);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[0]);

      // Right now, the balance of
      // Alice must be 10.
      // Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(10);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Transfer 5 tokens from Alice to Bob, repeating this process twice.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice --> Bob
      //  0, 5      0, 5, 10, 10
      //  0, 0      0, 10, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(5);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(30);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[1]);

      // Right now, the balance of Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[0]);

      // Right now, the balance of Bob must be 10.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(10);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[1]);

      // Right now, the balance of Bob must be 0.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(0);
    });

    it("[HAPPY] transfer correctly if frame size is 6 and slot per epoch is 4", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice, bob} = await deployERC20EXPBase({frameSize: 6, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceExpectExp = [];
      const bobExpectExp = [];

      // Ensure we are in [epoch: 0, slot 0].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      const amount = 10;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      aliceExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      list = await erc20exp.tokenList(bob.address, epoch, slot);
      bobExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice     Bob
      //  10, 10    10, 10

      // Right now, the balance of Alice and Bob must be 20.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount * 2);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(amount * 2);

      // Transfer 5 token from Alice to Bob.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice --> Bob
      //  5, 10     5, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(15);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[0]);

      // Right now, the balance of
      // Alice must be 10.
      // Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(10);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Transfer 5 tokens from Alice to Bob, repeating this process twice.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice --> Bob
      //  0, 5      0, 5, 10, 10
      //  0, 0      0, 10, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(5);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(30);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[1]);

      // Right now, the balance of Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[0]);

      // Right now, the balance of Bob must be 10.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(10);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[1]);

      // Right now, the balance of Bob must be 0.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(0);
    });

    it("[HAPPY] transfer correctly if frame size is 8 and slot per epoch is 4", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice, bob} = await deployERC20EXPBase({frameSize: 8, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceExpectExp = [];
      const bobExpectExp = [];

      // Ensure we are in [epoch: 0, slot 0].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      const amount = 10;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(0);

      // Mint into [epoch: 0, slot 0].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      aliceExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(1);

      // Mint into [epoch: 0, slot 1].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      list = await erc20exp.tokenList(bob.address, epoch, slot);
      bobExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice     Bob
      //  10, 10    10, 10

      // Right now, the balance of Alice and Bob must be 20.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount * 2);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(amount * 2);

      // Transfer 5 token from Alice to Bob.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice --> Bob
      //  5, 10     5, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(15);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[0]);

      // Right now, the balance of
      // Alice must be 10.
      // Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(10);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Transfer 5 tokens from Alice to Bob, repeating this process twice.
      // |-------------- 78892315 --------------|   <-- epoch 1.
      // {19723078}{19723078}{19723078}{19723078}   <-- 4 slot.
      //  *  [0]    *  [1]       [2]       [3]
      //  Alice --> Bob
      //  0, 5      0, 5, 10, 10
      //  0, 0      0, 10, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(5);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(30);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[1]);

      // Right now, the balance of Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[0]);

      // Right now, the balance of Bob must be 10.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(10);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[1]);

      // Right now, the balance of Bob must be 0.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(0);
    });

    it("[HAPPY] transfer correctly if frame size is 2 and slot per epoch is 4 and mint at end epoch period", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice, bob} = await deployERC20EXPBase({frameSize: 2, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceExpectExp = [];
      const bobExpectExp = [];

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 3].
      await mineBlock(blockPerSlot);

      // Ensure we are in [epoch: 0, slot 3].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(3);

      // Mint into [epoch: 0, slot 3].
      const amount = 10;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 3].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(3);

      // Mint into [epoch: 0, slot 3].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      aliceExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [epoch: 1, slot 0].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 1, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(1);
      expect(slot).equal(0);

      // Mint into [epoch: 1, slot 0].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 1, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(1);
      expect(slot).equal(0);

      // Mint into [epoch: 1, slot 0].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      list = await erc20exp.tokenList(bob.address, epoch, slot);
      bobExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   *   [3]   *  [0]       [1]       [2]       [3]
      //                               Alice     Bob
      //                               10, 10    10, 10

      // Right now, the balance of Alice and Bob must be 20.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount * 2);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(amount * 2);

      // Transfer 5 token from Alice to Bob.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   *   [3]   *  [0]       [1]       [2]       [3]
      //                               Alice     Bob
      //                               5, 10 --> 5, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(15);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[0]);

      // Right now, the balance of
      // Alice must be 10.
      // Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(10);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // // Transfer 5 tokens from Alice to Bob, repeating this process twice.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   *   [3]   *  [0]       [1]       [2]       [3]
      //                               Alice     Bob
      //                               0, 5  --> 0, 5, 10, 10
      //                               0, 0  --> 0, 10, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(5);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(30);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[1]);

      // Right now, the balance of Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[0]);

      // Right now, the balance of Bob must be 10.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(10);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[1]);

      // Right now, the balance of Bob must be 0.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(0);
    });

    it("[HAPPY] transfer correctly if frame size is 4 and slot per epoch is 4 and mint at end epoch period", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice, bob} = await deployERC20EXPBase({frameSize: 4, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceExpectExp = [];
      const bobExpectExp = [];

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 3].
      await mineBlock(blockPerSlot);

      // Ensure we are in [epoch: 0, slot 3].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(3);

      // Mint into [epoch: 0, slot 3].
      const amount = 10;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 3].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(3);

      // Mint into [epoch: 0, slot 3].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      aliceExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [epoch: 1, slot 0].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 1, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(1);
      expect(slot).equal(0);

      // Mint into [epoch: 1, slot 0].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 1, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(1);
      expect(slot).equal(0);

      // Mint into [epoch: 1, slot 0].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      list = await erc20exp.tokenList(bob.address, epoch, slot);
      bobExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   *   [3]   *  [0]       [1]       [2]       [3]
      //                               Alice     Bob
      //                               10, 10    10, 10

      // Right now, the balance of Alice and Bob must be 20.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount * 2);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(amount * 2);

      // Transfer 5 token from Alice to Bob.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   *   [3]   *  [0]       [1]       [2]       [3]
      //                               Alice     Bob
      //                               5, 10 --> 5, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(15);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[0]);

      // Right now, the balance of
      // Alice must be 10.
      // Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(10);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // // Transfer 5 tokens from Alice to Bob, repeating this process twice.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   *   [3]   *  [0]       [1]       [2]       [3]
      //                               Alice     Bob
      //                               0, 5  --> 0, 5, 10, 10
      //                               0, 0  --> 0, 10, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(5);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(30);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[1]);

      // Right now, the balance of Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[0]);

      // Right now, the balance of Bob must be 10.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(10);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[1]);

      // Right now, the balance of Bob must be 0.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(0);
    });

    it("[HAPPY] transfer correctly if frame size is 6 and slot per epoch is 4 and mint at end epoch period", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice, bob} = await deployERC20EXPBase({frameSize: 6, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceExpectExp = [];
      const bobExpectExp = [];

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 3].
      await mineBlock(blockPerSlot);

      // Ensure we are in [epoch: 0, slot 3].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(3);

      // Mint into [epoch: 0, slot 3].
      const amount = 10;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 0, slot 3].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(3);

      // Mint into [epoch: 0, slot 3].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      aliceExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // Skip to [epoch: 1, slot 0].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 1, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(1);
      expect(slot).equal(0);

      // Mint into [epoch: 1, slot 0].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 1, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(1);
      expect(slot).equal(0);

      // Mint into [epoch: 1, slot 0].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      list = await erc20exp.tokenList(bob.address, epoch, slot);
      bobExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   *   [3]   *  [0]       [1]       [2]       [3]
      //                               Alice     Bob
      //                               10, 10    10, 10

      // Right now, the balance of Alice and Bob must be 20.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount * 2);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(amount * 2);

      // Transfer 5 token from Alice to Bob.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   *   [3]   *  [0]       [1]       [2]       [3]
      //                               Alice     Bob
      //                               5, 10 --> 5, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(15);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[0]);

      // Right now, the balance of
      // Alice must be 10.
      // Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(10);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // // Transfer 5 tokens from Alice to Bob, repeating this process twice.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   *   [3]   *  [0]       [1]       [2]       [3]
      //                               Alice     Bob
      //                               0, 5  --> 0, 5, 10, 10
      //                               0, 0  --> 0, 10, 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(5);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(30);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[1]);

      // Right now, the balance of Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[0]);

      // Right now, the balance of Bob must be 10.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(10);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[1]);

      // Right now, the balance of Bob must be 0.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(0);
    });

    it("[HAPPY] transfer correctly if frame size is 8 and slot per epoch is 4 and mint at end epoch period", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice, bob} = await deployERC20EXPBase({frameSize: 8, slotSize: 4});

      const blockPerSlot = await erc20exp.getBlockPerSlot();
      const blockPerFrame = await erc20exp.getFrameSizeInBlockLength();

      const aliceExpectExp = [];
      const bobExpectExp = [];

      // Skip to [epoch: 0, slot 1].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 2].
      await mineBlock(blockPerSlot);
      // Skip to [epoch: 0, slot 3].
      await mineBlock(blockPerSlot);

      // Ensure we are in [epoch: 0, slot 3].
      let [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(0);
      expect(slot).equal(3);

      // Mint into [epoch: 0, slot 3].
      const amount = 10;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      let list = await erc20exp.tokenList(alice.address, epoch, slot);
      aliceExpectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [epoch: 1, slot 0].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 1, slot 0].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(1);
      expect(slot).equal(0);

      // Mint into [epoch: 1, slot 0].
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);

      list = await erc20exp.tokenList(alice.address, epoch, slot);
      aliceExpectExp.push(Number(list[0]) + blockPerFrame);
      expect(list.length).equal(1);

      // Skip to [epoch: 1, slot 1].
      await mineBlock(blockPerSlot);
      // Ensure we are in [epoch: 1, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(1);
      expect(slot).equal(1);

      // Mint into [epoch: 1, slot 1].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      // Skip 100 blocks
      await mineBlock(100);
      // Ensure we are in [epoch: 1, slot 1].
      [epoch, slot] = await erc20exp.currentEpochAndSlot();
      expect(epoch).equal(1);
      expect(slot).equal(1);

      // Mint into [epoch: 1, slot 1].
      await expect(erc20exp["mint(address,uint256)"](bob.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, bob.address, amount);

      list = await erc20exp.tokenList(bob.address, epoch, slot);
      bobExpectExp.push(Number(list[0]) + blockPerFrame, Number(list[1]) + blockPerFrame);
      expect(list.length).equal(2);

      // blocks in year equal to 78892315 since blocktime equal to 400ms.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   |    [3]  |   [0]   |   [1]       [2]       [3]
      //                               |Alice    |         |
      //                               |10,      |10       |
      //                               |Bob      |         |
      //                               |         |         | 10, 10

      // Right now, the balance of Alice and Bob must be 20.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(amount * 2);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(amount * 2);

      // Transfer 5 token from Alice to Bob.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   |    [3]  |   [0]   |   [1]       [2]       [3]
      //                               |Alice    |         |
      //                               |0,       |5        |
      //                               |Bob      |         |
      //                               |10       |5        | 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 15))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 15);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(5);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(35);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[0]);

      // Right now, the balance of
      // Alice must be 5.
      // Bob must be 25.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(5);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(25);

      // // Transfer 5 tokens from Alice to Bob, repeating this process twice.
      // |-------------- 78892315 --------------||-------------- 78892315 --------------|  <-- epoch 2.
      // {19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}{19723078}  <-- 8 slot.
      //     [0]       [1]       [2]   |    [3]  |   [0]   |   [1]       [2]       [3]
      //                               |Alice    |         |
      //                               |0,       |0        |
      //                               |Bob      |         |
      //                               |0        |10       | 10, 10

      expect(await erc20exp.connect(alice)["transfer(address,uint256)"](bob.address, 5))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(alice.address, bob.address, 5);
      expect(await erc20exp["balanceOf(address)"](alice.address)).equal(0);
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(30);

      // Skip to the expiry period of Alice.
      await skipToBlock(aliceExpectExp[1]);

      // Right now, the balance of Bob must be 20.
      // Because Alice's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(20);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[0]);

      // Right now, the balance of Bob must be 10.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(10);

      // Skip to the expiry period of Bob.
      await skipToBlock(bobExpectExp[1]);

      // Right now, the balance of Bob must be 0.
      // Because Bob's 10 tokens have expired.
      expect(await erc20exp["balanceOf(address)"](bob.address)).equal(0);
    });

    it("[UNHAPPY] transfer from zero address", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({});

      expect(erc20exp.badTransfer(common.zeroAddress, await alice.getAddress(), 1))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidSender)
        .withArgs(common.zeroAddress);
    });

    it("[UNHAPPY] transfer to zero address", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice} = await deployERC20EXPBase({});

      expect(erc20exp.connect(alice)["transfer(address,uint256)"](common.zeroAddress, 1))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InvalidReceiver)
        .withArgs(common.zeroAddress);
    });

    it("[UNHAPPY] insufficient balance", async function () {
      // Start at block 100.
      const startBlockNumber = 100;

      await mineBlock(startBlockNumber);
      const {erc20exp, alice, bob} = await deployERC20EXPBase({});

      expect(erc20exp.connect(alice)["transfer(address,uint256)"](await bob.getAddress(), 1))
        .to.be.revertedWithCustomError(erc20exp, ERC20.errors.ERC20InsufficientBalance)
        .withArgs(await alice.getAddress(), 0, 1);
    });
  });
};
