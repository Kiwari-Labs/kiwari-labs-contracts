import {constants} from "../../../../constant.test";
import * as AddToSuspend from "./addToSuspend.test";
import * as RemoveFromSuspend from "./removeFromSuspend.test";
import * as Mint from "./mint.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818Suspend", async function () {
    AddToSuspend.run({epochType});
    RemoveFromSuspend.run({epochType});
    Mint.run({epochType});
    Burn.run({epochType});
    Transfer.run({epochType});
  });
};
