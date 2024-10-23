import * as SetQuota from "./SetQuota.test";
import * as ResetQuota from "./ResetQuota.test";
import * as Mint from "./Mint.test";

export const run = async () => {
  describe("ERC20EXPMintQuota", async function () {
    SetQuota.run();
    ResetQuota.run();
    Mint.run();
  });
};
