import {constants} from "../../../../constant.test";
import * as AddToBlacklist from "./addToBlacklist.test";
import * as RemoveFromBlacklist from "./removeFromBlacklist.test";
import * as Mint from "./mint.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818Blacklist", async function () {
    AddToBlacklist.run({epochType});
    RemoveFromBlacklist.run({epochType});
    Mint.run({epochType});
    Burn.run({epochType});
    Transfer.run({epochType});
  });
};
