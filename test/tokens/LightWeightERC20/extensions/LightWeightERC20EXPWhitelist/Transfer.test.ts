import {expect} from "chai";
import {deployLightWeightERC20EXPWhitelist} from "../../../../utils.test";
import {ZERO_ADDRESS} from "../../../../constant.test";
import {parseEther} from "ethers/lib/utils";
import {network} from "hardhat";
import {reset, time, mineUpTo} from "@nomicfoundation/hardhat-network-helpers";

export const run = async () => {
  describe("Transfer", async function () {
    it("[HAPPY] correct transfer", async function () {
      const {erc20expWhitelist, alice, bob} = await deployLightWeightERC20EXPWhitelist({});

      const oneEther = parseEther("1.0");

      const balanceAliceBeforeMint = await erc20expWhitelist["balanceOf(address)"](alice.address);
      await expect(await erc20expWhitelist.mintRetail(alice.address, oneEther))
        .to.emit(erc20expWhitelist, "Transfer")
        .withArgs(ZERO_ADDRESS, alice.address, oneEther);
      const balanceAliceAfterMint = await erc20expWhitelist["balanceOf(address)"](alice.address);
      expect(balanceAliceBeforeMint).to.equal(0);
      expect(balanceAliceAfterMint).to.equal(oneEther);

      await expect(erc20expWhitelist.connect(alice).transfer(bob.address, oneEther))
        .to.emit(erc20expWhitelist, "Transfer")
        .withArgs(alice.address, bob.address, oneEther);
      const balanceBob = await erc20expWhitelist["balanceOf(address)"](bob.address);
      expect(balanceBob).to.equal(oneEther);
    });

    it("[HAPPY] correct bulk transfer", async function () {
      const {erc20expWhitelist, alice, bob} = await deployLightWeightERC20EXPWhitelist({});

      const oneEther = parseEther("1.0");
      const bulkEther = parseEther("273.0");

      const balanceAliceBeforeMint = await erc20expWhitelist["balanceOf(address)"](alice.address);
      for (let index = 0; index < 273; index++) {
        await expect(await erc20expWhitelist.mintRetail(alice.address, oneEther))
          .to.emit(erc20expWhitelist, "Transfer")
          .withArgs(ZERO_ADDRESS, alice.address, oneEther);
      }
      const balanceAliceAfterMint = await erc20expWhitelist["balanceOf(address)"](alice.address);
      expect(balanceAliceBeforeMint).to.equal(0);
      expect(balanceAliceAfterMint).to.equal(bulkEther);

      await expect(await erc20expWhitelist.connect(alice).transfer(bob.address, bulkEther))
        .to.emit(erc20expWhitelist, "Transfer")
        .withArgs(alice.address, bob.address, bulkEther);
      const balanceAliceAfterTransfer = await erc20expWhitelist["balanceOf(address)"](alice.address);
      const balanceBob = await erc20expWhitelist["balanceOf(address)"](bob.address);
      const aliceTokenList = await erc20expWhitelist.tokenList(alice.address, 0n, 0n);
      const bobTokenList = await erc20expWhitelist.tokenList(bob.address, 0n, 0n);

      expect(balanceBob).to.equal(bulkEther);
      expect(bobTokenList.length).to.equal(273);
      expect(aliceTokenList.length).to.equal(0);
      expect(balanceAliceAfterTransfer).to.equal(0);
    });

    it("[HAPPY] correct bulk transfer across slot", async function () {
      await reset();
      expect(await time.latestBlock()).to.equal(0);
      const {erc20expWhitelist, alice, bob} = await deployLightWeightERC20EXPWhitelist({});

      const oneEther = parseEther("1.0");
      const twoEther = parseEther("2.0");

      await expect(await erc20expWhitelist.mintRetail(alice.address, oneEther))
        .to.emit(erc20expWhitelist, "Transfer")
        .withArgs(ZERO_ADDRESS, alice.address, oneEther);

      let currentEraAndSlot = await erc20expWhitelist.currentEraAndSlot();
      expect(currentEraAndSlot.era).to.equal(0);
      expect(currentEraAndSlot.slot).to.equal(0);

      await mineUpTo((await erc20expWhitelist.getBlockPerSlot()) + 1);

      currentEraAndSlot = await erc20expWhitelist.currentEraAndSlot();
      expect(currentEraAndSlot.era).to.equal(0);
      expect(currentEraAndSlot.slot).to.equal(1);

      await expect(await erc20expWhitelist.mintRetail(alice.address, oneEther))
        .to.emit(erc20expWhitelist, "Transfer")
        .withArgs(ZERO_ADDRESS, alice.address, oneEther);

      const balanceAlice = await erc20expWhitelist["balanceOf(address)"](alice.address);
      expect(balanceAlice).to.equal(twoEther);
      await expect(await erc20expWhitelist.connect(alice).transfer(bob.address, twoEther))
        .to.emit(erc20expWhitelist, "Transfer")
        .withArgs(alice.address, bob.address, twoEther);
      const balanceBob = await erc20expWhitelist["balanceOf(address)"](bob.address);
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
