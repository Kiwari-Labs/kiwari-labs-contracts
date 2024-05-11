import { expect } from "chai";
import { deployERC20EXP } from "../utils.test";
import { ZERO_ADDRESS } from "../constant.test";
// import { ERC20_EXP_NAME, ERC20_EXP_SYMBOL } from "../constant.test";

export const run = async () => {
  describe("Mint", async function () {
    it("[HAPPY] correct mint", async function () {
      // TODO: add test case (suitable logic and event response).
      const { erc20exp, alice} = await deployERC20EXP();
      const aliceAddress = await alice.getAddress();
      const before = await erc20exp["balanceOf(address)"](aliceAddress);
      await expect(await erc20exp._mintRetail(aliceAddress, 10000n))
        .to.emit(erc20exp, "Transfer")
        .withArgs(ZERO_ADDRESS, aliceAddress, 10000n);
      const after = await erc20exp["balanceOf(address)"](aliceAddress);
      expect(before).to.equal(0);
      expect(after).to.equal(10000n);
    });

    it("[UNHAPPY] mint to zero address", async function () {
      // TODO: add test case (suitable logic and event response).
    });
  });

  describe("Mint To Wholesaler", async function () {
    it("[HAPPY] correct mint", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] mint to zero address", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] mint to non-wholesaler", async function () {
      // TODO: add test case (suitable logic and event response).
    });
  });

  describe("Mint To Retailer", async function () {
    it("[HAPPY] correct mint", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] mint to zero address", async function () {
      // TODO: add test case (suitable logic and event response).
    });

    it("[UNHAPPY] mint to non-retailer", async function () {
      // TODO: add test case (suitable logic and event response).
    });
  });
};
