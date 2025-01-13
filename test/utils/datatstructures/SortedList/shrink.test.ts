import {expect} from "chai";
import {hardhat_reset} from "../../../utils.test";
import {deploySortedList} from "./deployer.test";

export const run = async () => {
  describe("Shrink", async function () {
    const front = 1;
    const element = 2;
    const elementSecond = 3;
    const elementThird = 4;
    const back = 5;

    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] shrink", async function () {
      const {sortedlist} = await deploySortedList("");
      await sortedlist.insert(front);
      await sortedlist.insert(element);
      await sortedlist.insert(back);
      expect(await sortedlist.front()).to.equal(front);
      expect(await sortedlist.contains(element)).to.equal(true);
      expect(await sortedlist.back()).to.equal(back);
      await sortedlist.shrink(element);
      expect(await sortedlist.front()).to.equal(element);
      expect(await sortedlist.contains(front)).to.equal(false);
    });

    it("[SUCCESS] shrink then insert back", async function () {
      const {sortedlist} = await deploySortedList("");
      await sortedlist.insert(front);
      await sortedlist.insert(element);
      await sortedlist.insert(elementSecond);
      await sortedlist.insert(elementThird);
      await sortedlist.insert(back);
      expect(await sortedlist.front()).to.equal(front);
      expect(await sortedlist.contains(element)).to.equal(true);
      expect(await sortedlist.back()).to.equal(back);
      await sortedlist.shrink(elementThird);
      expect(await sortedlist.front()).to.equal(elementThird);
      expect(await sortedlist.contains(element)).to.equal(true);
      await sortedlist.insertLazy(element);
      expect(await sortedlist.front()).to.equal(element);
    });

    it("[FAILED] shrink the non-exist element", async function () {
      const {sortedlist} = await deploySortedList("");
      expect(await sortedlist.isEmpty()).to.equal(true);
      await sortedlist.shrink(element);
      await sortedlist.insertLazy(element);
      expect(await sortedlist.isEmpty()).to.equal(true);
    });

    it("[FAILED] shrink the ignore element", async function () {
      const {sortedlist} = await deploySortedList("");
      await sortedlist.insert(front);
      await sortedlist.insert(element)
      await sortedlist.insert(back);
      expect(await sortedlist.front()).to.equal(front);
      expect(await sortedlist.contains(element)).to.equal(true);
      expect(await sortedlist.back()).to.equal(back);
      await sortedlist.shrink(element);
      expect(await sortedlist.front()).to.equal(element);
      expect(await sortedlist.contains(front)).to.equal(false);
      await sortedlist.shrink(front);
      expect(await sortedlist.contains(front)).to.equal(false);
    });
  });
};
