import * as ERC20EXPMintQuota from "./ERC20EXPMintQuota/index.test";
import * as ERC20EXPNearestExpiryQuery from "./ERC20EXPNearestExpiryQuery/index.test";
import * as ERC20EXPWhitelist from "./ERC20EXPWhitelist/index.test";

export const run = async () => {
  describe("extensions", async function () {
    ERC20EXPMintQuota.run();
    ERC20EXPNearestExpiryQuery.run();
    ERC20EXPWhitelist.run();
  });
};
