import * as ERC20EXPWhitelist from "./ERC20EXPWhitelist/index.test";

export const run = async () => {
  describe("extensions", async function () {
    ERC20EXPWhitelist.run();
  });
};
