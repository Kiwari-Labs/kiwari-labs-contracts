import {constants} from "../../../constant.test";
import * as Mint from "./mint.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";
import * as Approval from "./approve.test";
import * as TransferFrom from "./transferFrom.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("base", async function () {
    Mint.run({epochType});
    Burn.run({epochType});
    Approval.run({epochType});
    Transfer.run({epochType});
    TransferFrom.run({epochType});
  });
};
