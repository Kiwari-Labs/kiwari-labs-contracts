import * as AddToBlacklist from "./addToBlacklist.test";
import * as RemoveFromBlacklist from "./removeFromBlacklist.test";
import * as Mint from "./mint.test";
import * as Transfer from "./transfer.test";

export const run = async () => {
  describe("ERC7818Backlist", async function () {
    RemoveFromBlacklist.run();
    AddToBlacklist.run();
    Mint.run();
    Transfer.run();
  });
};
