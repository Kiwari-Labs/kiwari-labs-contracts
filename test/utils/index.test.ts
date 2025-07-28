// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import * as BLSW from "./algorithms/BLSW/index.test";
// import * as TLSW from "./algorithms/BLSW/index.test";
import * as SortedList from "./datatstructures/SortedList/index.test";
// import * as XortedList from "./datatstructures/XortedList/index.test";

export const run = async () => {
  describe("utils", async function () {
    BLSW.run();
    // TLSW.run();
    SortedList.run();
    // XortedList.run();
  });
};
