import * as General from "./General.test";
import * as Mint from "./Mint.test";
import * as Burn from "./Burn.test";
import * as Transfer from "./Transfer.test";
import * as Approval from "./Approval.test";
import * as TransferFrom from "./TransferFrom.test";

export const run = async () => {
  describe.only("ERC20EXPBase", async function () {
    General.run();
    Mint.run();
    Burn.run();
    Transfer.run();
    Approval.run();
    TransferFrom.run();
  });
};
