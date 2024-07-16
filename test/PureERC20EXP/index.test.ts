import * as Mint from "./Mint.test";

export const run = async () => {
  describe.only("ERC20EXP", async function () {
    Mint.run();
  });
};
