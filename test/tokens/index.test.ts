import * as ERC20 from "./ERC20/index.test";
import * as ERC721 from "./ERC721/index.test";

export const run = async () => {
  describe("tokens", async function () {
    ERC20.run();
    ERC721.run();
  });
};
