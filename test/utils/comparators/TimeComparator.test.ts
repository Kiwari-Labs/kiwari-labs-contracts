import {expect} from "chai";
import {deployComparatorLibrary} from "./utils.test";

export const run = async () => {
  describe("Time Comparator", async function () {
    it("[SUCCESS] beforeBlock", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.blockBeforeBlock(0, 1)).to.equal(true);
    });

    it("[FAILED] beforeBlock", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.blockBeforeBlock(1, 0)).to.equal(false);
    });

    it("[SUCCESS] afterBlock", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.blockAfterBlock(1, 0)).to.equal(true);
    });

    it("[FAILED] afterBlock", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.blockAfterBlock(0, 1)).to.equal(false);
    });

    it("[SUCCESS] beforeTimeStamp", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.timestampBeforeTimestamp(0, 1)).to.equal(true);
    });

    it("[FAILED] afterTimeStamp", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.timestampAfterTimestamp(1, 0)).to.equal(true);
    });

    it("[SUCCESS] blockOrTimeCompareTo less than", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.blockortimeCompareTo(1, 0)).to.equal(1);
    });

    it("[SUCCESS] blockOrTimeCompareTo equal", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.blockortimeCompareTo(0, 0)).to.equal(0);
    });

    it("[SUCCESS] blockOrTimeCompareTo greater than", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.blockortimeCompareTo(0, 1)).to.equal(-1);
    });
  });
};
