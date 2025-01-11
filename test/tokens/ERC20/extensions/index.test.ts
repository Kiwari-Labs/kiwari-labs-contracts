import {constants} from "../../../constant.test";
import * as ERC7818Backlist from "./ERC7818Backlist/index.test";
import * as ERC7818MintQuota from "./ERC7818MintQuota/index.test";
import * as ERC7818Whitelist from "./ERC7818Whitelist/index.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("extensions", async function () {
    ERC7818Backlist.run({epochType});
    ERC7818MintQuota.run({epochType});
    ERC7818Whitelist.run({epochType});
  });
};
