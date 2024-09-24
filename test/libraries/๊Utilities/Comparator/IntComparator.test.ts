import { expect } from "chai";
import { deployComparatorLibrary } from "../../../utils.test";

export const run = async () => {
  describe("Int Comparator", async function () {
    it("[HAPPY] int less than", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intLessthan(0, 1)).to.equal(true);
    });

    it("[UNHAPPY] int less than", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intLessthan(1, 0)).to.equal(false);
      expect(await comparator.intLessthan(0, 0)).to.equal(false);
    });

    it("[HAPPY] int greater than", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intGreaterthan(1, 0)).to.equal(true);
    });

    it("[UNHAPPY] int greater than", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intGreaterthan(0, 0)).to.equal(false);
      expect(await comparator.intGreaterthan(0, 1)).to.equal(false);
    });

    it("[HAPPY] int less than or equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intLessThanOrEqual(0, 0)).to.equal(true);
      expect(await comparator.intLessThanOrEqual(0, 1)).to.equal(true);
    });

    it("[UNHAPPY] int less than or equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intLessThanOrEqual(1, 0)).to.equal(false);
    });

    it("[HAPPY] int greater than or equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intGreaterThanOrEqual(0, 0)).to.equal(true);
      expect(await comparator.intGreaterThanOrEqual(1, 0)).to.equal(true);
    });

    it("[UNHAPPY] int greater than or equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intGreaterThanOrEqual(0, 1)).to.equal(false);
    });

    it("[HAPPY] int equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intEqual(0, 0)).to.equal(true);
    });

    it("[UNHAPPY] int equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intEqual(0, 1)).to.equal(false);
    });

    it("[HAPPY] int not equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intNotEqual(0, 1)).to.equal(true);
    });

    it("[UNHAPPY] int not equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intNotEqual(0, 0)).to.equal(false);
    });

    it("[HAPPY] int compare to less than", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intCompareTo(1, 0)).to.equal(1);
    });

    it("[HAPPY] int compare to equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intCompareTo(0, 0)).to.equal(0);
    });

    it("[HAPPY] int compare to greater", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.intCompareTo(0, 1)).to.equal(-1);
    });
  });
};
