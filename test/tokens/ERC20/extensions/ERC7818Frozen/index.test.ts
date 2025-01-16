import {constants} from "../../../../constant.test";
import * as Freeze from "./freeze.test";
import * as Unfreeze from "./unfreeze.test";
import * as Mint from "./mint.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818Frozen", async function () {
    Freeze.run({epochType});
    Unfreeze.run({epochType});
    Mint.run({epochType});
    Burn.run({epochType});
    Transfer.run({epochType});
  });
};
