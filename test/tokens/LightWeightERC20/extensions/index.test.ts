import * as LightWeightERC20EXPWhitelist from "./LightWeightERC20EXPWhitelist/index.test";

export const run = async () => {
  describe("extensions", async function () {
    LightWeightERC20EXPWhitelist.run();
  });
};
