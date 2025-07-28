// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import * as General from "./general.test";
import * as Insert from "./insert.test";
import * as Remove from "./remove.test";
import * as Shrink from "./shrink.test";

export const run = async () => {
  describe("SortedList", async function () {
    General.run();
    Insert.run();
    Remove.run();
    Shrink.run();
  });
};
