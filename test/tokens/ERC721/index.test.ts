// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {constants} from "../../constant.test";
import * as base from "./base/index.test";
import * as behavior from "./ERC7858Behavior/index.test";
import * as extensions from "./extensions/index.test";

export const run = async () => {
  describe("ERC721BLSW", async function () {
    const epochType = constants.EPOCH_TYPE.BLOCKS_BASED;
    base.run({epochType});
    behavior.run({epochType});
    extensions.run({epochType});
  });

  describe("ERC721TLSW", async function () {
    const epochType = constants.EPOCH_TYPE.TIME_BASED;
    base.run({epochType});
    behavior.run({epochType});
    extensions.run({epochType});
  });
};
