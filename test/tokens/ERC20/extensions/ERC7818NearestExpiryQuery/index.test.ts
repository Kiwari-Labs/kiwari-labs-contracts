import {constants} from "../../../../constant.test";
import * as NearestExpiryQuery from "./nearestExpiryQuery.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818NearestExpiryQuery", async function () {
    NearestExpiryQuery.run({epochType});
  });
};
