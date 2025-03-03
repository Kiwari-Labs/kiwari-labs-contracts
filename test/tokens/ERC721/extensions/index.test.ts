// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {constants} from "../../../constant.test";
import * as ERC7858Epoch from "./ERC7858Epoch/index.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("extensions", async function () {
    ERC7858Epoch.run({epochType});
  });
};
