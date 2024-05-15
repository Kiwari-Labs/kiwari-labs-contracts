import { expect } from "chai";
import { ethers } from "hardhat";
import { deployERC20EXP } from "../utils.test";
import { ZERO_ADDRESS } from "../constant.test";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
// import { ERC20_EXP_NAME, ERC20_EXP_SYMBOL } from "../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint", async function () {
      // TODO: add test case (suitable logic and event response).
      const { erc20exp, alice ,bob} = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      const before = await erc20exp["balanceOf(address)"](aliceAddress);
      for(let i = 0; i < 10; i++) {
        await expect(await erc20exp._mintRetail(aliceAddress, 1000n))
        .to.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 1000n);
      }
      const after = await erc20exp["balanceOf(address)"](aliceAddress);
      expect(before).to.equal(0);
      expect(after).to.equal(10000n);
      await mine(await erc20exp.expirationPeriodInBlockLength());
      // clear all balance
      const shouldbezero = await erc20exp["balanceOf(address)"](aliceAddress);
      expect(shouldbezero).to.equal(0);
      // test sliding window working or nor
      await erc20exp._mintRetail(aliceAddress, 1000n)
      await mine(1000);
      await erc20exp._mintRetail(aliceAddress, 1000n)
      await mine((await erc20exp.expirationPeriodInBlockLength()- 1000));
      const page = await erc20exp.pagination();
      console.log("🚀 ~ expire:", page.toString())
      const after1 = await erc20exp["balanceOf(address)"](aliceAddress);
      console.log("🚀 ~ after:", after1);
      expect(after1).to.equal(1000n);
      await erc20exp.connect(alice).transfer(bobAddress, 1000n);
      const after2 = await erc20exp["balanceOf(address)"](bobAddress);
      console.log("🚀 ~ after:", after2);
      const after3 = await erc20exp["balanceOf(address)"](aliceAddress);
      console.log("🚀 ~ after:", after3);
    });
    

    it("[UNHAPPY] mint to zero address", async function () {
      // TODO: add test case (suitable logic and event response).
    });
  });

  describe("Mint To Wholesaler", async function () {
    it("[HAPPY] correct mint", async function () {
      // TODO: add test case (suitable logic and event response).
      const { erc20exp, alice } = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      // await expect(erc20exp._mintWholeSale(aliceAddress, 1))
      // .to.be.emit(erc20exp,"Transfer")
      // .withArgs(ZERO_ADDRESS, aliceAddress, 1);
    });

    it("[UNHAPPY] mint to zero address", async function () {
      // TODO: add test case (suitable logic and event response).
      //  const { erc20exp } = await deployERC20EXP();
      //  await expect(erc20exp._mintWholeSale(ZERO_ADDRESS, 1)).to.be.revertedWith("ERC20: mint to the zero address");  
    });

    it("[UNHAPPY] mint to non-wholesaler", async function () {
      // TODO: add test case (suitable logic and event response).
      // const { erc20exp, bob } = await deployERC20EXP();
      // const bobAddress = await bob.getAddress();
      // await expect(erc20exp._mintWholeSale(ZERO_ADDRESS, 1)).to.be.revertedWith("ERC20: mint to the zero address");  
    });
  });

  describe("Mint To Retailer", async function () {
    it("[HAPPY] correct mint", async function () {
      // TODO: add test case (suitable logic and event response).
      const { erc20exp, alice } = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      await expect(erc20exp._mintRetail(aliceAddress, 1))
       .to.be.emit(erc20exp,"Transfer")
       .withArgs(ZERO_ADDRESS, aliceAddress, 1);
       const balance = await erc20exp["balanceOf(address)"](aliceAddress);
       expect(balance).to.equal(1);
    });

    it("[UNHAPPY] mint to zero address", async function () {
      // TODO: add test case (suitable logic and event response).
      const { erc20exp } = await deployERC20EXP();
      await expect(erc20exp._mintRetail(ZERO_ADDRESS, 1)).to.be.revertedWith("ERC20: mint to the zero address");
    });

    it("[UNHAPPY] mint to non-retailer", async function () {
      // TODO: add test case (suitable logic and event response).
      const { erc20exp, alice } = await deployERC20EXP();
      const bobAddress = await alice.getAddress();
      // await erc20exp.grantWholeSale(bobAddress,true);
      await erc20exp._mintRetail(bobAddress, 1000);
      // await expect(erc20exp._mintRetail(bobAddress, 1)).to.be.revertedWith("can't mint non-expirable token to non wholesale account");
    });
  });
};
