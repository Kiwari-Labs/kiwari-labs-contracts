import * as Mint from "./Mint.test";
import * as TransferFrom from "./TransferFrom.test";
import * as Burn from "./Burn.test";
import * as Expiration from "./Expiration.test";
import * as Transfer from "./Transfer.test";
import * as Whitelist from "./Whitelist.test";

export const run = async () => {
  describe("ERC7818Whitelist", async function () {
    Mint.run();
    TransferFrom.run();
    Burn.run();
    Expiration.run();
    Transfer.run();
    Whitelist.run();
  });
};
