import {constants} from "../../../constant.test";
import * as Interface from "./interface.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";
import * as TransferAtEpoch from "./transferAtEpoch.test";
import * as TransferFromAtEpoch from "./transferFromAtEpoch.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818Behavior", async function () {
    Interface.run({epochType});
    Burn.run({epochType});
    Transfer.run({epochType});
    TransferAtEpoch.run({epochType});
    TransferFromAtEpoch.run({epochType});
  });
};
