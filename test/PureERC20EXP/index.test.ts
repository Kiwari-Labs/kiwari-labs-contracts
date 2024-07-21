import * as Mint from "./Mint.test";
import * as Burn from "./Burn.test";
import * as Transfer from "./Transfer.test";

export const run = async () => {
  describe.only("ERC20EXP", async function () {
    Mint.run();
    Burn.run();
    Transfer.run();
  });
};
