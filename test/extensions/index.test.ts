import * as ERC20EXPWhitelist from "./ERC20EXPWhitelist/index.test";
// import * as LightWeightERC20EXPWhitelist from "./LightWeightERC20EXPWhitelist/index.test";
import * as ERC20EXPNearestExpiryQuery from "./ERC20EXPNearestExpiryQuery/index.test";
import * as ERC20EXPMintQuota from "./ERC20EXPMintQuota/index.test";
import * as ERC20EXPBacklist from "./ERC20EXPBacklist/index.test";

export const run = async () => {
  describe("extensions", async function () {
    ERC20EXPWhitelist.run();
    ERC20EXPNearestExpiryQuery.run();
    // LightWeightERC20.run();
    ERC20EXPMintQuota.run();
    ERC20EXPBacklist.run();
  });
};
