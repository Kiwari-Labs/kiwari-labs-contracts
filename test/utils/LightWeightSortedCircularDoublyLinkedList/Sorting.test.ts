import {expect} from "chai";
import {deployLightWeightDoublyListLibrary} from "./utils.test";

export const run = async () => {
  describe("Sorting", async function () {
    it("[HAPPY] asc sort correctly", async function () {
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary({
        autoList: true,
        len: 5,
      });
      const sorted = await lightWeightDoublyList.ascending();
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).to.equal(i + 1);
      }
    });

    it("[HAPPY] des sort correctly", async function () {
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary({
        autoList: true,
        len: 5,
      });
      const sorted = await lightWeightDoublyList.descending();
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).to.equal(sorted.length - i);
      }
    });

    it("[UNHAPPY] sort the empty array with asc", async function () {
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();
      const sorted = await lightWeightDoublyList.ascending();
      expect(sorted.length).to.equal(0);
    });

    it("[UNHAPPY] sort the empty array with des", async function () {
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();
      const sorted = await lightWeightDoublyList.descending();
      expect(sorted.length).to.equal(0);
    });
  });
};
