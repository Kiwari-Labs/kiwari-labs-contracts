// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import * as ERC20 from "./ERC20/index.test";
import * as ERC721 from "./ERC721/index.test";

export const run = async () => {
  describe("tokens", async function () {
    ERC20.run();
    ERC721.run();
  });
};
