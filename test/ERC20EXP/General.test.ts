import { expect } from "chai";
import { deployERC20EXP } from "../utils.test";
import { ERC20_EXP_NAME, ERC20_EXP_SYMBOL } from "../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] correct name", async function () {
      const { erc20exp } = await deployERC20EXP();

      expect(await erc20exp.name()).to.equal(ERC20_EXP_NAME);
    });

    it("[HAPPY] correct symbol", async function () {
      const { erc20exp } = await deployERC20EXP();

      expect(await erc20exp.symbol()).to.equal(ERC20_EXP_SYMBOL);
    });
  });
};
