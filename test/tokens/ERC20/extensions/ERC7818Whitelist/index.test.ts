import * as Mint from "./mint.test";
import * as TransferFrom from "./transferFrom.test";
import * as Burn from "./burn.test";
import * as Expiration from "./Expiration.test";
import * as Transfer from "./transfer.test";
import * as AddToWhitelist from "./addToWhitelist.test";
import * as RemoveFromWhitelist from "./removeFromWhitelist.test";

export const run = async () => {
  describe("ERC7818Whitelist", async function () {
    Mint.run();
    TransferFrom.run();
    Burn.run();
    Expiration.run();
    Transfer.run();
    AddToWhitelist.run();
    RemoveFromWhitelist.run();
  });
};
