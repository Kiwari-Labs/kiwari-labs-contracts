// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {constants} from "../../../constant.test";
import * as ERC7818Blacklist from "./ERC7818Blacklist/index.test";
import * as ERC7818MintQuota from "./ERC7818MintQuota/index.test";
import * as ERC7818Exception from "./ERC7818Exception/index.test";
import * as ERC7818NearestExpiryQuery from "./ERC7818NearestExpiryQuery/index.test";
import * as ERC7818Frozen from "./ERC7818Frozen/index.test";
import * as ERC7818Permit from "./ERC7818Permit/index.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818:Extensions", async function () {
    ERC7818Blacklist.run({epochType});
    ERC7818MintQuota.run({epochType});
    ERC7818Exception.run({epochType});
    ERC7818NearestExpiryQuery.run({epochType});
    ERC7818Frozen.run({epochType});
    ERC7818Permit.run({epochType});
  });
};
