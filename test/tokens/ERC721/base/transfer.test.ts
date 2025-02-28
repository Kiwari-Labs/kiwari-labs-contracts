// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC721Selector} from "./deployer.test";
import {ERC721, constants} from "../../../constant.test";
import {ethers, hardhat_impersonate, hardhat_reset, hardhat_setBalance, hardhat_stopImpersonating} from "../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Transfer", async function () {
    const tokenId = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    // @TODO
  });
};
