// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC721Selector} from "./deployer.test";
import {ERC721, constants} from "../../../constant.test";
import {hardhat_reset} from "../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("TransferFrom", async function () {
    const tokenId = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    // @TODO
  });
};
