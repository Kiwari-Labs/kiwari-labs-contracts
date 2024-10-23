import * as AddToBlacklist from "./AddToBlacklist.test";
import * as RemoveFromBlacklist from "./RemoveFromBlacklist.test";
import * as Mint from "./Mint.test";
import * as Transfer from "./Transfer.test";

export const run = async () => {
  describe("ERC20EXPBacklist", async function () {
    RemoveFromBlacklist.run();
    AddToBlacklist.run();
    Mint.run();
    Transfer.run();
  });
};
