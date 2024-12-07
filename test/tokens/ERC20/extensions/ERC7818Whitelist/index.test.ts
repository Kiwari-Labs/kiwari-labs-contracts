import * as AddToWhitelist from "./addToWhitelist.test";
import * as RemoveFromWhitelist from "./removeFromWhitelist.test";
import * as Mint from "./mint.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";
import * as TransferFrom from "./transferFrom.test";

export const run = async () => {
  describe("ERC7818Whitelist", async function () {
    AddToWhitelist.run();
    RemoveFromWhitelist.run();
    Mint.run();
    Burn.run();
    Transfer.run();
    TransferFrom.run();
  });
};
