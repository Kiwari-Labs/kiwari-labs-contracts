import {expect} from "chai";
import {deployLightWeightERC20EXPWhitelist} from "../../../../utils.test";
import {ERC20_EXP_NAME, ERC20_EXP_SYMBOL} from "../../../../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] correct name", async function () {
      const {erc20expWhitelist} = await deployLightWeightERC20EXPWhitelist({});

      expect(await erc20expWhitelist.name()).to.equal(ERC20_EXP_NAME);
    });

    it("[HAPPY] correct symbol", async function () {
      const {erc20expWhitelist} = await deployLightWeightERC20EXPWhitelist({});

      expect(await erc20expWhitelist.symbol()).to.equal(ERC20_EXP_SYMBOL);
    });

    it("[HAPPY] correct symbol", async function () {
      const {erc20expWhitelist} = await deployLightWeightERC20EXPWhitelist({});

      // due to token can expiration there is no actual totalSupply.
      expect(await erc20expWhitelist.totalSupply()).to.equal(0);
    });
  });
};
