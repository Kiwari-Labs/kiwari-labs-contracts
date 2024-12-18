import * as ERC7818Backlist from "./ERC7818Backlist/index.test";
import * as ERC7818MintQuota from "./ERC7818MintQuota/index.test";
import * as ERC7818Whitelist from "./ERC7818Whitelist/index.test";

export const run = async () => {
  describe.skip("extensions", async function () {
    ERC7818Backlist.run();
    ERC7818MintQuota.run();
    ERC7818Whitelist.run();
  });
};
