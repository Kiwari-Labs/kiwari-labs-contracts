// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {constants} from "../../../../constant.test";
import * as Freeze from "./freeze.test";
import * as Unfreeze from "./unfreeze.test";
import * as Mint from "./mint.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818Frozen", async function () {
    Freeze.run({epochType});
    Unfreeze.run({epochType});
    Mint.run({epochType});
    Burn.run({epochType});
    Transfer.run({epochType});
  });
};
