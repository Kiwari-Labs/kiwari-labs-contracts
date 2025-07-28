// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {deployERC7818NearestExpiryQuerySelector} from "./deployer.test";
import {constants} from "../../../../constant.test";
import {hardhat_latestPointer, hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("NearestExpiryOf", async function () {
    const amount = 100;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] nearest expiry query", async function () {
      const {erc7818NearestExpiryQuery, alice} = await deployERC7818NearestExpiryQuerySelector({epochType});
      await erc7818NearestExpiryQuery.mint(alice.address, amount);
      const pointerInWindow = Number(
        (await erc7818NearestExpiryQuery.epochLength()) * (await erc7818NearestExpiryQuery.validityDuration()),
      );
      const latestPointer = await hardhat_latestPointer(epochType);
      const [balance, expiry] = await erc7818NearestExpiryQuery.getNearestExpiryOf(alice.address);
      expect(balance).to.equal(amount);
      expect(expiry).to.equal(latestPointer + pointerInWindow);
    });

    it("[SUCCESS] nearest expiry query empty", async function () {
      const {erc7818NearestExpiryQuery, alice} = await deployERC7818NearestExpiryQuerySelector({epochType});
      const [balance, expiry] = await erc7818NearestExpiryQuery.getNearestExpiryOf(alice.address);
      expect(balance).to.equal(0);
      expect(expiry).to.equal(0);
    });
  });
};
