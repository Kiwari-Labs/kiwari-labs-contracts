import * as General from "./General.test";
import * as Mint from "./Mint.test";
import * as Approval from "./Approval.test";
import * as Burn from "./Burn.test";
import * as Expiration from "./Expiration.test";
import * as Transfer from "./Transfer.test";

export const run = async () => {
  describe("LightWeightERC20EXPWhitelist", async function () {
    General.run();
    Mint.run();
    Approval.run();
    Burn.run();
    Expiration.run();
    Transfer.run();
  });
};
