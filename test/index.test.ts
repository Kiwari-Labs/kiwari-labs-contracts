// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import * as tokens from "./tokens/index.test";
import * as utils from "./utils/index.test";
import {EventEmitter} from "events";

describe("Scenario", async function () {
  EventEmitter.setMaxListeners(1000);
  // abstracts.run();
  tokens.run();
  utils.run();
});
