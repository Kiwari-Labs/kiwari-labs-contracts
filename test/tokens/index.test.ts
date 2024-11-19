import * as ERC20 from "./ERC20/index.test";
// import * as ERC20Extensions from "./ERC20/extensions/index.test";
// import * as ERC721 from "./ERC721/index.test";
// // import * as ERC721Extensions from "./ERC20/extensions/index.test";
// import * as ERC1155 from "./ERC1155/index.test";
// // import * as ERC1155Extensions from "./ERC20/extensions/index.test";
// import * as LightWeightERC20 from "./LightWeightERC20/index.test";
// import * as LightWeightERC20Extensions from "./LightWeightERC20/extensions/index.test";

export const run = async () => {
  describe("tokens", async function () {
    ERC20.run();
    // ERC20Extensions.run();
    // ERC721.run();
    // ERC721Extensions.run();
    // ERC1155.run();
    // ERC721Extensions.run();
    // LightWeightERC20.run();
    // LightWeightERC20Extensions.run();
  });
};
