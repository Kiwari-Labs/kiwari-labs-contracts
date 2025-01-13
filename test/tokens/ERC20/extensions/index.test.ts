import {constants} from "../../../constant.test";
import * as ERC7818Blacklist from "./ERC7818Blacklist/index.test";
import * as ERC7818MintQuota from "./ERC7818MintQuota/index.test";
import * as ERC7818Whitelist from "./ERC7818Whitelist/index.test";
import * as ERC7818NearestExpiryQuery from "./ERC7818NearestExpiryQuery/index.test";
import * as ERC7818Suspend from "./ERC7818Suspend/index.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("extensions", async function () {
    ERC7818Blacklist.run({epochType});
    ERC7818MintQuota.run({epochType});
    ERC7818Whitelist.run({epochType});
    ERC7818NearestExpiryQuery.run({epochType});
    ERC7818Suspend.run({epochType});
  });
};
