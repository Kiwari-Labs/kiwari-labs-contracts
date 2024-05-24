import { expect } from "chai";
import { deployDoublyList, padIndexToData } from "../utils.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query middle from even list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 4 });
      expect(await doublylist.middle()).to.equal(2);
    });

    it("[HAPPY] query middle from odd list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      // Please note that why the middle of 5 is 2.
      // Because in terms of actual implementation, we can not returns the node at a position of 2.5.
      expect(await doublylist.middle()).to.equal(2);
    });

    it("[HAPPY] query guard", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      const guard = await doublylist.guard();
      expect(guard[0]).to.equal(5); // Head of _SENTINEL.
      expect(guard[1]).to.equal(1); // Tail of _SENTINEL.
    });

    it("[HAPPY] query first partition from odd list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      // [1, 2, 3, 4, 5] => [1, 2]
      const list = await doublylist.firstPartition();
      expect(list.length).to.equal(2);
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(i + 1);
      }
    });

    it("[HAPPY] query first partition from even list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 6 });
      // [1, 2, 3, 4, 5, 6] => [1, 2, 3]
      const list = await doublylist.firstPartition();
      expect(list.length).to.equal(3);
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(i + 1);
      }
    });

    it("[HAPPY] query second partition from odd list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      // [1, 2, 3, 4, 5] => [5, 4, 3]
      const list = await doublylist.secondPartition();
      expect(list.length).to.equal(3);
      // The first element is 5 because the secondPartitionList() will split and calculate the partition from the back.
      // The reason is reducing gas usage. Sorting should be processed outside the contract.
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(5 - i);
      }
    });

    it("[HAPPY] query second partition from even list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 6 });
      // [1, 2, 3, 4, 5, 6] => [6, 5, 4]
      const list = await doublylist.secondPartition();
      expect(list.length).to.equal(3);
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(6 - i);
      }
    });

    it("[HAPPY] query partition from index to head", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true });
      // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] => [7, 6, 5, 4, 3, 2, 1]
      const start = 7;
      const list = await doublylist.pathToHead(start);
      expect(list.length).to.equal(start);
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(start - i);
      }
    });

    it("[HAPPY] query partition from index to tail", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true });
      // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] => [7, 8, 9, 10]
      const start = 7;
      const len = 10;
      const list = await doublylist.pathToTail(start);
      expect(list.length).to.equal(len - start + 1);
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(start + i);
      }
    });

    it("[HAPPY] query partition", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true });
      // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] => [7, 8, 9, 10, 1, 2, 3, 4, 5, 6]
      let start = 7;
      const len = 10;
      const list = await doublylist.partition(start);
      expect(list.length).to.equal(len);
      for (let i = 0; i < list.length; i++) {
        if (start + i > len) {
          start = start - len;
        }
        expect(list[i]).to.equal(start + i);
      }
    });

    it("[UNHAPPY] always returns empty when the list has no element", async function () {
      const { doublylist } = await deployDoublyList();
      let list = await doublylist.firstPartition();
      expect(list.length).to.equal(0);
      list = await doublylist.secondPartition();
      expect(list.length).to.equal(0);
      list = await doublylist.partition(0);
      expect(list.length).to.equal(0);
      list = await doublylist.pathToHead(0);
      expect(list.length).to.equal(0);
      list = await doublylist.pathToTail(0);
      expect(list.length).to.equal(0);
    });

    it("[UNHAPPY] the index not found in list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true });
      let list = await doublylist.partition(11);
      expect(list.length).to.equal(0);
      list = await doublylist.pathToHead(11);
      expect(list.length).to.equal(0);
      list = await doublylist.pathToTail(11);
      expect(list.length).to.equal(0);
    });
  });
};
