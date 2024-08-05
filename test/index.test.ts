import * as LightWeightERC20EXPBase from "./LightWeightERC20EXPBase/index.test";
import * as ERC20EXPWhitelist from "./ERC20EXPWhitelist/index.test";
import * as LightWeightERC20EXPWhitelist from "./LightWeightERC20EXPWhitelist/index.test";
import * as abstracts from "./abstracts/index.test";
import * as libraries from "./libraries/index.test";

describe("Scenario", async function () {
  // LightWeightERC20EXPBase.run();

  // ERC20EXPWhitelist.run();
  // LightWeightERC20EXPWhitelist.run();

  abstracts.run();

  libraries.run();
});
