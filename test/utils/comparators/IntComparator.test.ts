import {expect} from "chai";
import {deployComparatorLibrary} from "./utils.test";

export const run = async () => {
  describe("Int Comparator", async function () {
    it("[SUCCESS] int less than", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intLessthan(0, 1)).to.equal(true);
    });

    it("[FAILED] int less than", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intLessthan(1, 0)).to.equal(false);
      expect(await comparator.intLessthan(0, 0)).to.equal(false);
    });

    it("[SUCCESS] int greater than", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intGreaterthan(1, 0)).to.equal(true);
    });

    it("[FAILED] int greater than", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intGreaterthan(0, 0)).to.equal(false);
      expect(await comparator.intGreaterthan(0, 1)).to.equal(false);
    });

    it("[SUCCESS] int less than or equal", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intLessThanOrEqual(0, 0)).to.equal(true);
      expect(await comparator.intLessThanOrEqual(0, 1)).to.equal(true);
    });

    it("[FAILED] int less than or equal", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intLessThanOrEqual(1, 0)).to.equal(false);
    });

    it("[SUCCESS] int greater than or equal", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intGreaterThanOrEqual(0, 0)).to.equal(true);
      expect(await comparator.intGreaterThanOrEqual(1, 0)).to.equal(true);
    });

    it("[FAILED] int greater than or equal", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intGreaterThanOrEqual(0, 1)).to.equal(false);
    });

    it("[SUCCESS] int equal", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intEqual(0, 0)).to.equal(true);
    });

    it("[FAILED] int equal", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intEqual(0, 1)).to.equal(false);
    });

    it("[SUCCESS] int not equal", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intNotEqual(0, 1)).to.equal(true);
    });

    it("[FAILED] int not equal", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intNotEqual(0, 0)).to.equal(false);
    });

    it("[SUCCESS] int compare to less than", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intCompareTo(1, 0)).to.equal(1);
    });

    it("[SUCCESS] int compare to equal", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intCompareTo(0, 0)).to.equal(0);
    });

    it("[SUCCESS] int compare to greater", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.intCompareTo(0, 1)).to.equal(-1);
    });
  });
};
