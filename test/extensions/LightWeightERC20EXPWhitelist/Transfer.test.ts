import {expect} from "chai";
import {deployLightWeightERC20EXP} from "../../utils.test";
import {ZERO_ADDRESS} from "../../constant.test";
import {parseEther} from "ethers/lib/utils";
import {network} from "hardhat";
import {reset, time, mineUpTo} from "@nomicfoundation/hardhat-network-helpers";

export const run = async () => {
  describe("Transfer", async function () {
    it("[HAPPY] correct transfer", async function () {
      const {erc20exp, alice, bob} = await deployLightWeightERC20EXP();

      const oneEther = parseEther("1.0");
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();

      const balanceAliceBeforeMint = await erc20exp["balanceOf(address)"](aliceAddress);
      await expect(await erc20exp.mintRetail(aliceAddress, oneEther))
        .to.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, oneEther);
      const balanceAliceAfterMint = await erc20exp["balanceOf(address)"](aliceAddress);
      expect(balanceAliceBeforeMint).to.equal(0);
      expect(balanceAliceAfterMint).to.equal(oneEther);

      await expect(erc20exp.connect(alice).transfer(bobAddress, oneEther))
        .to.emit(erc20exp, "Transfer")
        .withArgs(aliceAddress, bobAddress, oneEther);
      const balanceBob = await erc20exp["balanceOf(address)"](bobAddress);
      expect(balanceBob).to.equal(oneEther);
    });

    it("[HAPPY] correct bulk transfer", async function () {
      const {erc20exp, alice, bob} = await deployLightWeightERC20EXP();

      const oneEther = parseEther("1.0");
      const bulkEther = parseEther("273.0");
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();

      const balanceAliceBeforeMint = await erc20exp["balanceOf(address)"](aliceAddress);
      for (let index = 0; index < 273; index++) {
        await expect(await erc20exp.mintRetail(aliceAddress, oneEther))
          .to.emit(erc20exp, "Transfer")
          .withArgs(ZERO_ADDRESS, aliceAddress, oneEther);
      }
      const balanceAliceAfterMint = await erc20exp["balanceOf(address)"](aliceAddress);
      expect(balanceAliceBeforeMint).to.equal(0);
      expect(balanceAliceAfterMint).to.equal(bulkEther);

      await expect(await erc20exp.connect(alice).transfer(bobAddress, bulkEther))
        .to.emit(erc20exp, "Transfer")
        .withArgs(aliceAddress, bobAddress, bulkEther);
      const balanceAliceAfterTransfer = await erc20exp["balanceOf(address)"](aliceAddress);
      const balanceBob = await erc20exp["balanceOf(address)"](bobAddress);
      const aliceTokenList = await erc20exp.tokenList(aliceAddress, 0n, 0n);
      const bobTokenList = await erc20exp.tokenList(bobAddress, 0n, 0n);

      expect(balanceBob).to.equal(bulkEther);
      expect(bobTokenList.length).to.equal(273);
      expect(aliceTokenList.length).to.equal(0);
      expect(balanceAliceAfterTransfer).to.equal(0);
    });

    it("[HAPPY] correct bulk transfer across slot", async function () {
      await reset();
      expect(await time.latestBlock()).to.equal(0);
      const {erc20exp, alice, bob} = await deployLightWeightERC20EXP();

      const oneEther = parseEther("1.0");
      const twoEther = parseEther("2.0");
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();

      await expect(await erc20exp.mintRetail(aliceAddress, oneEther))
        .to.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, oneEther);

      let currentEraAndSlot = await erc20exp.currentEraAndSlot();
      expect(currentEraAndSlot.era).to.equal(0);
      expect(currentEraAndSlot.slot).to.equal(0);

      await mineUpTo((await erc20exp.getBlockPerSlot()) + 1);

      currentEraAndSlot = await erc20exp.currentEraAndSlot();
      expect(currentEraAndSlot.era).to.equal(0);
      expect(currentEraAndSlot.slot).to.equal(1);

      await expect(await erc20exp.mintRetail(aliceAddress, oneEther))
        .to.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, oneEther);

      const balanceAlice = await erc20exp["balanceOf(address)"](aliceAddress);
      expect(balanceAlice).to.equal(twoEther);
      await expect(await erc20exp.connect(alice).transfer(bobAddress, twoEther))
        .to.emit(erc20exp, "Transfer")
        .withArgs(aliceAddress, bobAddress, twoEther);
      const balanceBob = await erc20exp["balanceOf(address)"](bobAddress);
      expect(balanceBob).to.equal(twoEther);
    });

    it("[HAPPY] correct bulk transfer across era", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[HAPPY] correct transferFrom", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] should not be transfer to zero address", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] insufficient balance", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] should not transferable the token that expired", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    // In cases of Wholesale and Retail are still in the designing phase to be discussed later.
  });
};
