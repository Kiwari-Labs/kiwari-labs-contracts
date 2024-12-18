import * as ERC20EXPBase from "./base/index.test";
import * as ERC7818Behavior from "./ERC7818Behavior/index.test";
import * as extensions from "./extensions/index.test";

export const run = async () => {
  describe("ERC20EXPBase", async function () {
    ERC20EXPBase.run();
    ERC7818Behavior.run();
    extensions.run();
  });
};
