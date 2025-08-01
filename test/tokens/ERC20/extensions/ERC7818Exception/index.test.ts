// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import * as AddToException from "./addToException.test";
import * as RemoveFromException from "./removeFromException.test";
import * as Mint from "./mint.test";
import * as Burn from "./burn.test";
import * as Transfer from "./transfer.test";
import * as TransferFrom from "./transferFrom.test";
import {constants} from "../../../../constant.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("ERC7818Exception", async function () {
    AddToException.run({epochType});
    RemoveFromException.run({epochType});
    Mint.run({epochType});
    Burn.run({epochType});
    Transfer.run({epochType});
    TransferFrom.run({epochType});
  });
};
