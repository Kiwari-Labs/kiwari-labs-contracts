import { expect } from "chai";
import { deployLightWeightDoublyList } from "../utils.test";

export const run = async () => {
  describe("Shrink", async function () {
    it("[HAPPY] correct shrink of even linked list", async function () {
      const { doublylist } = await deployLightWeightDoublyList({
        autoList: true,
        len: 10,
      });
      // Removing all nodes before the specified index.
      // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] => [5, 6, 7, 8, 9, 10]
      await doublylist.shrink(5);
      expect(await doublylist.size()).to.equal(6);
      const list = await doublylist.ascending();
      for (let i = 0; i < 6; i++) {
        expect(list[i]).to.equal(5 + i);
      }
      const node = await doublylist.node(2);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
    });

    it("[HAPPY] correct shrink of odd linked list", async function () {
      const { doublylist } = await deployLightWeightDoublyList({
        autoList: true,
        len: 9,
      });
      // Removing all nodes before the specified index.
      // [1, 2, 3, 4, 5, 6, 7, 8, 9] => [5, 6, 7, 8, 9]
      await doublylist.shrink(5);
      expect(await doublylist.size()).to.equal(5);
      const list = await doublylist.ascending();
      for (let i = 0; i < 5; i++) {
        expect(list[i]).to.equal(5 + i);
      }
      const node = await doublylist.node(3);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
    });

    it("[UNHAPPY] correct shrink of empty linked list", async function () {
      const { doublylist } = await deployLightWeightDoublyList({});
      await doublylist.shrink(1);
      expect(await doublylist.size()).to.equal(0);
    });
  });
};
