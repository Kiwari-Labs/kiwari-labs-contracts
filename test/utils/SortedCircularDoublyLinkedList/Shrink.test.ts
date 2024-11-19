import {expect} from "chai";
import { deployDoublyListLibrary } from "./utils.test";

export const run = async () => {
  describe("Shrink", async function () {
    it("[HAPPY] shrink correctly of even linked list", async function () {
      const {doublyList} = await deployDoublyListLibrary({
        autoList: true,
        len: 10,
      });
      // Removing all nodes before the specified index.
      // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] => [5, 6, 7, 8, 9, 10]
      await doublyList.shrink(5);
      expect(await doublyList.size()).to.equal(6);
      const list = await doublyList.ascending();
      for (let i = 0; i < 6; i++) {
        expect(list[i]).to.equal(5 + i);
      }
      const node = await doublyList.node(2);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
      expect(node.data).to.equal("0x");
    });

    it("[HAPPY] shrink correctly of odd linked list", async function () {
      const {doublyList} = await deployDoublyListLibrary({
        autoList: true,
        len: 9,
      });
      // Removing all nodes before the specified index.
      // [1, 2, 3, 4, 5, 6, 7, 8, 9] => [5, 6, 7, 8, 9]
      await doublyList.shrink(5);
      expect(await doublyList.size()).to.equal(5);
      const list = await doublyList.ascending();
      for (let i = 0; i < 5; i++) {
        expect(list[i]).to.equal(5 + i);
      }
      const node = await doublyList.node(3);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
      expect(node.data).to.equal("0x");
    });

    it("[UNHAPPY] shrink correctly of empty linked list", async function () {
      const {doublyList} = await deployDoublyListLibrary({});
      await doublyList.shrink(1);
      expect(await doublyList.size()).to.equal(0);
    });
  });
};
