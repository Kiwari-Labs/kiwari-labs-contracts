import {constants} from "../../../../constant.test";
import * as Transfer from "./transfer.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818Permit", async function () {
    Transfer.run({epochType});
  });
};
