import * as AddToWhitelist from "./addToWhitelist.test";
import * as RemoveFromWhitelist from "./removeFromWhitelist.test";
import * as Mint from "./mint.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";
import * as TransferFrom from "./transferFrom.test";
import {constants} from "../../../../constant.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818Whitelist", async function () {
    AddToWhitelist.run({epochType});
    RemoveFromWhitelist.run({epochType});
    Mint.run({epochType});
    Burn.run({epochType});
    Transfer.run({epochType});
    TransferFrom.run({epochType});
  });
};
