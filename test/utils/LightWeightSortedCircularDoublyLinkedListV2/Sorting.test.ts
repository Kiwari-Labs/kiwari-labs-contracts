import {expect} from "chai";
import {deployLightWeightDoublyListLibraryV2} from "./utils.test";

export const run = async () => {
  describe("Sorting", async function () {
    it("[HAPPY] asc sort correctly", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2({
        autoList: true,
        len: 5,
      });
      const sorted = await lightWeightDoublyListV2.ascending();
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).to.equal(i + 1);
      }
    });

    it("[HAPPY] des sort correctly", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2({
        autoList: true,
        len: 5,
      });
      const sorted = await lightWeightDoublyListV2.descending();
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).to.equal(sorted.length - i);
      }
    });

    it("[UNHAPPY] sort the empty array with asc", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();
      const sorted = await lightWeightDoublyListV2.ascending();
      expect(sorted.length).to.equal(0);
    });

    it("[UNHAPPY] sort the empty array with des", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();
      const sorted = await lightWeightDoublyListV2.descending();
      expect(sorted.length).to.equal(0);
    });
  });
};
