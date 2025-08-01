// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {hardhat_reset} from "../../../utils.test";
import {deploySortedList} from "./deployer.test";

export const run = async () => {
  describe("General", async function () {
    const element = 1;
    const sentinel = 0;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] contains", async function () {
      const {sortedlist} = await deploySortedList("");
      expect(await sortedlist.contains(element)).to.equal(false);
      expect(await sortedlist.contains(sentinel)).to.equal(true);
    });

    it("[SUCCESS] previous", async function () {
      const {sortedlist} = await deploySortedList("");
      expect(await sortedlist.previous(element)).to.equal(sentinel);
    });

    it("[SUCCESS] next", async function () {
      const {sortedlist} = await deploySortedList("");
      expect(await sortedlist.next(element)).to.equal(sentinel);
    });

    it("[SUCCESS] toArray", async function () {
      const {sortedlist} = await deploySortedList("");
      expect(await sortedlist.array()).to.deep.equal([]);
    });

    it("[SUCCESS] toArray with start point", async function () {
      const {sortedlist} = await deploySortedList("");
      for (let index = 1; index <= 10; index++) {
        await sortedlist.insert(index);
      }
      expect(await sortedlist.arrayWithStart(5)).to.deep.equal([5, 6, 7, 8, 9, 10]);
    });

    it("[SUCCESS] toArray return empty when start point not exist", async function () {
      const {sortedlist} = await deploySortedList("");
      for (let index = 1; index <= 10; index++) {
        await sortedlist.insert(index);
      }
      expect(await sortedlist.arrayWithStart(20)).to.deep.equal([]);
    });

    it("[SUCCESS] size", async function () {
      const {sortedlist} = await deploySortedList("");
      expect(await sortedlist.size()).to.deep.equal(512);
    });
  });
};
