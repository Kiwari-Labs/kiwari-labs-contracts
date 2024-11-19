import * as SetQuota from "./SetQuota.test";
import * as ResetQuota from "./ResetQuota.test";
import * as Mint from "./Mint.test";

export const run = async () => {
  describe("ERC7818MintQuota", async function () {
    SetQuota.run();
    ResetQuota.run();
    Mint.run();
  });
};
