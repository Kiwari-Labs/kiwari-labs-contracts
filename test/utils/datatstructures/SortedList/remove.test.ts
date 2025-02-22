// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

import {expect} from "chai";
import {hardhat_reset} from "../../../utils.test";
import {deploySortedList} from "./deployer.test";

export const run = async () => {
  describe("Remove", async function () {
    const front = 1;
    const element = 2;
    const back = 3;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] remove front", async function () {
      const {sortedlist} = await deploySortedList("");
      await sortedlist.insert(front);
      await sortedlist.insert(back);
      expect(await sortedlist.contains(front)).to.equal(true);
      await sortedlist.remove(front);
      expect(await sortedlist.contains(front)).to.equal(false);
      expect(await sortedlist.front()).to.equal(back);
    });

    it("[SUCCESS] remove back", async function () {
      const {sortedlist} = await deploySortedList("");
      await sortedlist.insert(front);
      await sortedlist.insert(back);
      expect(await sortedlist.contains(back)).to.equal(true);
      await sortedlist.remove(back);
      expect(await sortedlist.contains(back)).to.equal(false);
      expect(await sortedlist.back()).to.equal(front);
    });

    it("[SUCCESS] remove between front and back", async function () {
      const {sortedlist} = await deploySortedList("");
      await sortedlist.insert(front);
      await sortedlist.insert(element);
      await sortedlist.insert(back);
      expect(await sortedlist.contains(element)).to.equal(true);
      await sortedlist.remove(element);
      expect(await sortedlist.contains(element)).to.equal(false);
      expect(await sortedlist.front()).to.equal(front);
      expect(await sortedlist.back()).to.equal(back);
    });

    it("[FAILED] remove the non-exist element", async function () {
      const {sortedlist} = await deploySortedList("");
      expect(await sortedlist.isEmpty()).to.equal(true);
      await sortedlist.remove(4);
      expect(await sortedlist.isEmpty()).to.equal(true);
    });
  });
};
