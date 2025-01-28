import {constants} from "../../constant.test";
import * as ERC20Base from "./base/index.test";
import * as ERC7818Behavior from "./ERC7818Behavior/index.test";
import * as extensions from "./extensions/index.test";

export const run = async () => {
  describe("ERC20BLSW", async function () {
    const epochType = constants.EPOCH_TYPE.BLOCKS_BASED;
    ERC20Base.run({epochType});
    ERC7818Behavior.run({epochType});
    extensions.run({epochType});
  });

  describe("ERC20TLSW", async function () {
    const epochType = constants.EPOCH_TYPE.TIME_BASED;
    ERC20Base.run({epochType});
    ERC7818Behavior.run({epochType});
    extensions.run({epochType});
  });
};
