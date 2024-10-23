import {expect} from "chai";
import {deployComparatorLibrary} from "../../utils.test";

export const run = async () => {
  describe("Boolean Operation", async function () {
    it("[HAPPY] boolean and", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.booleanAnd(true, true)).to.equal(true);
    });

    it("[UNHAPPY] boolean and", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.booleanAnd(true, false)).to.equal(false);
      expect(await comparator.booleanAnd(false, true)).to.equal(false);
      expect(await comparator.booleanAnd(false, false)).to.equal(false);
    });

    it("[HAPPY] boolean or", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.booleanOr(true, true)).to.equal(true);
      expect(await comparator.booleanOr(true, false)).to.equal(true);
    });

    it("[UNHAPPY] boolean or", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.booleanOr(false, false)).to.equal(false);
    });

    it("[HAPPY] boolean exclusive or", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.booleanExclusiveOr(true, false)).to.equal(true);
      expect(await comparator.booleanExclusiveOr(false, true)).to.equal(true);
    });

    it("[UNHAPPY] boolean exclusive or", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.booleanExclusiveOr(true, true)).to.equal(false);
      expect(await comparator.booleanExclusiveOr(false, false)).to.equal(false);
    });
  });
};
