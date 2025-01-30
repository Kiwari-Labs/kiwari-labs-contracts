// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {constants} from "../../../../constant.test";
import * as AddMinter from "./addMinter.test";
import * as RemoveMinter from "./removeMinter.test";
import * as SetQuota from "./setQuota.test";
import * as IncreaseQuota from "./increaseQuota.test";
import * as DecreaseQuota from "./decreaseQuota.test";
import * as Mint from "./mint.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818MintQuota", async function () {
    AddMinter.run({epochType});
    RemoveMinter.run({epochType});
    SetQuota.run({epochType});
    IncreaseQuota.run({epochType});
    DecreaseQuota.run({epochType});
    Mint.run({epochType});
  });
};
