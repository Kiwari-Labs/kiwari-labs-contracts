import {expect} from "chai";
import {deployLightWeightDoublyListLibraryV2} from "./utils.test";

export const run = async () => {
  describe("Shrink", async function () {
    it("[HAPPY] shrink correctly of even linked list", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2({
        autoList: true,
        len: 10,
      });
      // Removing all nodes before the specified index.
      // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] => [5, 6, 7, 8, 9, 10]
      await lightWeightDoublyListV2.shrink(5);
      expect(await lightWeightDoublyListV2.size()).to.equal(6);
      const list = await lightWeightDoublyListV2.ascending();
      for (let i = 0; i < 6; i++) {
        expect(list[i]).to.equal(5 + i);
      }
      const node = await lightWeightDoublyListV2.node(2);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
    });

    it("[HAPPY] shrink correctly of odd linked list", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2({
        autoList: true,
        len: 9,
      });
      // Removing all nodes before the specified index.
      // [1, 2, 3, 4, 5, 6, 7, 8, 9] => [5, 6, 7, 8, 9]
      await lightWeightDoublyListV2.shrink(5);
      expect(await lightWeightDoublyListV2.size()).to.equal(5);
      const list = await lightWeightDoublyListV2.ascending();
      for (let i = 0; i < 5; i++) {
        expect(list[i]).to.equal(5 + i);
      }
      const node = await lightWeightDoublyListV2.node(3);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
    });

    it("[UNHAPPY] shrink correctly of empty linked list", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2({});
      await lightWeightDoublyListV2.shrink(1);
      expect(await lightWeightDoublyListV2.size()).to.equal(0);
    });
  });
};
