import * as General from "./General.test";
import * as Mint from "./Mint.test";
import * as Burn from "./Burn.test";
import * as Transfer from "./Transfer.test";
import * as Performance from "./Performance.test";

export const run = async () => {
  describe.only("ERC20EXP", async function () {
    General.run();
    Mint.run();
    Burn.run();
    Transfer.run();
    Performance.run();
  });
};
