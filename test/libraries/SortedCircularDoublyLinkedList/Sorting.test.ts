import {expect} from "chai";
import {deployDoublyListLibrary} from "../../utils.test";

export const run = async () => {
  describe("Sorting", async function () {
    it("[HAPPY] asc sort correctly", async function () {
      const {doublyList} = await deployDoublyListLibrary({autoList: true, len: 5});
      const sorted = await doublyList.ascending();
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).to.equal(i + 1);
      }
    });

    it("[HAPPY] des sort correctly", async function () {
      const {doublyList} = await deployDoublyListLibrary({autoList: true, len: 5});
      const sorted = await doublyList.descending();
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).to.equal(sorted.length - i);
      }
    });

    it("[UNHAPPY] sort the empty array with asc", async function () {
      const {doublyList} = await deployDoublyListLibrary();
      const sorted = await doublyList.ascending();
      expect(sorted.length).to.equal(0);
    });

    it("[UNHAPPY] sort the empty array with des", async function () {
      const {doublyList} = await deployDoublyListLibrary();
      const sorted = await doublyList.descending();
      expect(sorted.length).to.equal(0);
    });
  });
};
