import {expect} from "chai";
import {deployDoublyList} from "../utils.test";

export const run = async () => {
  describe("Sorting", async function () {
    it("[HAPPY] correct ascend sorting", async function () {
      const {doublylist} = await deployDoublyList({autoList: true, len: 5});
      const sorted = await doublylist.ascending();
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).to.equal(i + 1);
      }
    });

    it("[HAPPY] correct descend sorting", async function () {
      const {doublylist} = await deployDoublyList({autoList: true, len: 5});
      const sorted = await doublylist.descending();
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i]).to.equal(sorted.length - i);
      }
    });

    it("[UNHAPPY] sort the empty array with asc", async function () {
      const {doublylist} = await deployDoublyList();
      const sorted = await doublylist.ascending();
      expect(sorted.length).to.equal(0);
    });

    it("[UNHAPPY] sort the empty array with des", async function () {
      const {doublylist} = await deployDoublyList();
      const sorted = await doublylist.descending();
      expect(sorted.length).to.equal(0);
    });
  });
};
