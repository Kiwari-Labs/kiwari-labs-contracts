// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {constants} from "../../../constant.test";
import * as Interface from "./interface.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";
import * as TransferAtEpoch from "./transferAtEpoch.test";
import * as TransferFromAtEpoch from "./transferFromAtEpoch.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818:Behavior", async function () {
    Interface.run({epochType});
    Burn.run({epochType});
    Transfer.run({epochType});
    TransferAtEpoch.run({epochType});
    TransferFromAtEpoch.run({epochType});
  });
};
