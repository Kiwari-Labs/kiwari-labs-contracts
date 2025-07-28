// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import * as General from "./general.test";
import * as Epoch from "./epoch.test";
import * as WindowRange from "./windowRange.test";

export const run = async () => {
  describe("Block-based Lazy Sliding Window (BLSW)", async function () {
    General.run();
    Epoch.run();
    WindowRange.run();
  });
};
