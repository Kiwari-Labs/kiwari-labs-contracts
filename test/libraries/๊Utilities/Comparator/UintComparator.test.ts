import { expect } from "chai";
import { deployComparatorLibrary } from "../../../utils.test";

export const run = async () => {
  describe("Uint Comparator", async function () {
    it("[HAPPY] uint less than", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintLessthan(0, 1)).to.equal(true);
    });

    it("[UNHAPPY] uint less than", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintLessthan(1, 0)).to.equal(false);
      expect(await comparator.uintLessthan(0, 0)).to.equal(false);
    });

    it("[HAPPY] uint greater than", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintGreaterthan(1, 0)).to.equal(true);
    });

    it("[UNHAPPY] uint greater than", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintGreaterthan(0, 0)).to.equal(false);
      expect(await comparator.uintGreaterthan(0, 1)).to.equal(false);
    });

    it("[HAPPY] uint less than or equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintLessThanOrEqual(0, 0)).to.equal(true);
      expect(await comparator.uintLessThanOrEqual(0, 1)).to.equal(true);
    });

    it("[UNHAPPY] uint less than or equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintLessThanOrEqual(1, 0)).to.equal(false);
    });

    it("[HAPPY] uint greater than or equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintGreaterThanOrEqual(0, 0)).to.equal(true);
      expect(await comparator.uintGreaterThanOrEqual(1, 0)).to.equal(true);
    });

    it("[UNHAPPY] uint greater than or equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintGreaterThanOrEqual(0, 1)).to.equal(false);
    });

    it("[HAPPY] uint equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintEqual(0, 0)).to.equal(true);
    });

    it("[UNHAPPY] uint equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintEqual(0, 1)).to.equal(false);
    });

    it("[HAPPY] uint not equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintNotEqual(0, 1)).to.equal(true);
    });

    it("[UNHAPPY] uint not equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintNotEqual(0, 0)).to.equal(false);
    });

    it("[HAPPY] uint compare to equal", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintCompareTo(0, 0)).to.equal(0);
    });

    it("[HAPPY] uint compare to greater", async function () {
      const { comparator } = await deployComparatorLibrary({});
      expect(await comparator.uintCompareTo(0, 1)).to.equal(-1);
    });
  });
};
