import {constants} from "../../../../constant.test";
import * as SetQuota from "./setQuota.test";
import * as Mint from "./mint.test";
import * as ResetQuota from "./resetQuota.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818MintQuota", async function () {
    SetQuota.run({epochType});
    Mint.run({epochType});
    ResetQuota.run({epochType});
  });
};
