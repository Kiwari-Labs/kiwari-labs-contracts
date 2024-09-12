import {expect} from "chai";
import {deployERC20EXPWhitelist} from "../../utils.test";
import {ERC20_EXP_NAME, ERC20_EXP_SYMBOL} from "../../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] correct name", async function () {
      const {erc20exp} = await deployERC20EXPWhitelist();

      expect(await erc20exp.name()).to.equal(ERC20_EXP_NAME);
    });

    it("[HAPPY] correct symbol", async function () {
      const {erc20exp} = await deployERC20EXPWhitelist();

      expect(await erc20exp.symbol()).to.equal(ERC20_EXP_SYMBOL);
    });

    it("[HAPPY] correct symbol", async function () {
      const {erc20exp} = await deployERC20EXPWhitelist();

      // due to token can expiration there is no actual totalSupply.
      expect(await erc20exp.totalSupply()).to.equal(0);
    });
  });
};
