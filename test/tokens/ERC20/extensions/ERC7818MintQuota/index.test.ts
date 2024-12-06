import * as SetQuota from "./setQuota.test";
import * as ResetQuota from "./resetQuota.test";
import * as Mint from "./mint.test";

export const run = async () => {
  describe("ERC7818MintQuota", async function () {
    SetQuota.run();
    ResetQuota.run();
    Mint.run();
  });
};
