import * as ERC20 from "./ERC20/index.test";
import * as ERC20Extension from "./ERC20/extensions/index.test";
import * as LightWeightERC20 from "./LightWeightERC20/index.test";
import * as LightWeightERC20Extension from "./LightWeightERC20/extensions/index.test";

export const run = async () => {
  describe("abstracts", async function () {
    ERC20.run();
    ERC20Extension.run();
    LightWeightERC20.run();
    // LightWeightERC20Extension.run();
  });
};
