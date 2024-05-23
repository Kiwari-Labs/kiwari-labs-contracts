import { expect } from "chai";
import { deployDoublyList, padIndexToData } from "../utils.test";

export const run = async () => {
  describe("Sorting", async function () {
    it("[HAPPY] correct ascend sorting", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      const sorted = await doublylist.ascendingList();
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).to.equal(i + 1);
      }
    });

    it("[HAPPY] correct descend sorting", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      const sorted = await doublylist.descendingList();
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).to.equal(sorted.length - i);
      }
    });

    it("[UNHAPPY] sort the empty array with asc", async function () {
      const { doublylist } = await deployDoublyList();
      const sorted = await doublylist.ascendingList();
      expect(sorted.length).to.equal(0);
    });

    it("[UNHAPPY] sort the empty array with des", async function () {
      const { doublylist } = await deployDoublyList();
      const sorted = await doublylist.descendingList();
      expect(sorted.length).to.equal(0);
    });
  });
};
