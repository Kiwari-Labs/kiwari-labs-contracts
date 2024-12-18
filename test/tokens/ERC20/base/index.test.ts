import * as Interface from "./interface.test";
import * as Mint from "./mint.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";
import * as Approval from "./approve.test";
import * as TransferFrom from "./transferFrom.test";
// @TODO: import * as ERC7818Behavior form "./ERC7818Behavior.test";

export const run = async () => {
  describe("base", async function () {
    Interface.run();
    Mint.run();
    Burn.run();
    Approval.run();
    Transfer.run();
    TransferFrom.run();
    // @TODO: ERC7818Behavior.run();
  });
};
