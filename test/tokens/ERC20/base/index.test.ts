import * as Mint from "./mint.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";
import * as Approval from "./approve.test";
import * as TransferFrom from "./transferFrom.test";

export const run = async () => {
  describe("base", async function () {
    Mint.run();
    Burn.run();
    Approval.run();
    Transfer.run();
    TransferFrom.run();
  });
};
