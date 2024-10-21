import * as Whitelist from "./Whitelist.test";
import * as Mint from "./Mint.test";
import * as TransferFrom from "./TransferFrom.test";
import * as Burn from "./Burn.test";
import * as Expiration from "./Expiration.test";
import * as Transfer from "./Transfer.test";

export const run = async () => {
  describe("ERC20EXPWhitelist", async function () {
    Whitelist.run();
    Mint.run();
    TransferFrom.run();
    Burn.run();
    Expiration.run();
    Transfer.run();
  });
};
