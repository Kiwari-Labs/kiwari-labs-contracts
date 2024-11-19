import * as abstracts from "./abstracts/index.test";
import * as tokens from "./tokens/index.test";
import * as utils from "./utils/index.test";

describe("Scenario", async function () {
  abstracts.run();
  tokens.run();
  utils.run();
});
