import {expect} from "chai";
import {hardhat_reset} from "../../../utils.test";
import {deploySortedList} from "./deployer.test";

export const run = async () => {
  describe("Insert", async function () {
    const front = 1;
    const element = 2;
    const back = 3;
    const sentinel = 0;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] insert before front", async function () {
      const {sortedlist} = await deploySortedList("");
      await sortedlist.insert(element);
      expect(await sortedlist.front()).to.equal(element);
      await sortedlist.insert(front);
      expect(await sortedlist.front()).to.equal(front);
    });

    it("[SUCCESS] insert after back", async function () {
      const {sortedlist} = await deploySortedList("");
      await sortedlist.insert(element);
      expect(await sortedlist.back()).to.equal(element);
      await sortedlist.insert(back);
      expect(await sortedlist.back()).to.equal(back);
    });

    it("[SUCCESS] insert between front and back", async function () {
      const {sortedlist} = await deploySortedList("");
      await sortedlist.insert(front);
      await sortedlist.insert(back);
      expect(await sortedlist.front()).to.equal(front);
      expect(await sortedlist.back()).to.equal(back);
      await sortedlist.insert(element);
      expect(await sortedlist.contains(element)).to.equal(true);
    });

    it("[FAILED] insert the exist element", async function () {
      const {sortedlist} = await deploySortedList("");
      expect(await sortedlist.isEmpty()).to.equal(true);
      await sortedlist.insert(0);
      expect(await sortedlist.isEmpty()).to.equal(true);
    });
  });
};
