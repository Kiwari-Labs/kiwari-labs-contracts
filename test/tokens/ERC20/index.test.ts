import * as ERC20EXPBase from "./base/index.test";
import * as extensions from "./extensions/index.test";

export const run = async () => {
  describe("ERC20", async function () {
    ERC20EXPBase.run();
    extensions.run();
  });
};
