import * as tokens from "./tokens/index.test";
import * as utils from "./utils/index.test";
import {EventEmitter} from "events";

describe("Scenario", async function () {
  EventEmitter.setMaxListeners(1000);
  // abstracts.run();
  tokens.run();
  utils.run();
});
