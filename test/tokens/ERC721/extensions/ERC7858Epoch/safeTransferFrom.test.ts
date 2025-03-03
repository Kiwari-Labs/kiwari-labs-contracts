// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {hardhat_reset, hardhat_latestBlock, hardhat_latest} from "../../../../utils.test";
import {deployERC7858EpochSelector} from "./deployer.test";
import {ERC721, ERC7858, constants} from "../../../../constant.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("SafeTransferFrom", async function () {
    const tokenId = 1;
    const expectBalance = 1;
    let startTime = 0;
    let endTime = 0;

    afterEach(async function () {
      await hardhat_reset();
      /** ensure safety reset starTime and endTime to zero */
      startTime = 0;
      endTime = 0;
    });

    // @TODO
  });
};
