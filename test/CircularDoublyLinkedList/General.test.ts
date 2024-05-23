import { expect } from "chai";
import { deployDoublyList, padIndexToData } from "../utils.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] correct query middle from even list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 4 });
      expect(await doublylist.middle()).to.equal(2);
    });

    it("[HAPPY] correct query middle from odd list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      // Please note that why the middle of 5 is 2.
      // Because in terms of actual implementation, we can not returns the node at a position of 2.5.
      expect(await doublylist.middle()).to.equal(2);
    });

    it("[HAPPY] correct query guard", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      const guard = await doublylist.guard();
      expect(guard[0]).to.equal(5); // Head of _SENTINEL.
      expect(guard[1]).to.equal(1); // Tail of _SENTINEL.
    });

    it("[HAPPY] correct query first parition from odd list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      // [1, 2, 3, 4, 5] => [1, 2]
      const list = await doublylist.firstParitionList();
      expect(list.length).to.equal(2);
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(i + 1);
      }
    });

    it("[HAPPY] correct query first parition from even list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 6 });
      // [1, 2, 3, 4, 5, 6] => [1, 2, 3]
      const list = await doublylist.firstParitionList();
      expect(list.length).to.equal(3);
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(i + 1);
      }
    });

    it("[HAPPY] correct query second parition from odd list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      // [1, 2, 3, 4, 5] => [3, 4, 5]
      const list = await doublylist.secondPartitionList();
      expect(list.length).to.equal(3);
      // The first element is 5 because the secondPartitionList() will split and calculate the partition from the back.
      // The reason is reducing gas usage. Sorting should be processed outside the contract.
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(5 - i);
      }
    });

    it("[HAPPY] correct query partition list given to last", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true });
      // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] => [7, 8, 9, 10]
      const start = 7;
      const len = 10;
      const list = await doublylist.partitionListGivenToLast(start);
      expect(list.length).to.equal(len - start + 1);
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(start + i);
      }
    });

    it("[HAPPY] correct query partition list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true });
      // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] => [7, 8, 9, 10, 1, 2, 3, 4, 5, 6]
      let start = 7;
      const len = 10;
      const list = await doublylist.partitionList(start);
      expect(list.length).to.equal(len);
      for (let i = 0; i < list.length; i++) {
        if (start + i > len) {
          start = start - len;
        }
        expect(list[i]).to.equal(start + i);
      }
    });

    it("[HAPPY] correct query second parition from even list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 6 });
      // [1, 2, 3, 4, 5, 6] => [4, 5, 6]
      const list = await doublylist.secondPartitionList();
      expect(list.length).to.equal(3);
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(6 - i);
      }
    });

    it("[UNHAPPY] always returns empty when the list never has an element", async function () {
      const { doublylist } = await deployDoublyList();
      let list = await doublylist.firstParitionList();
      expect(list.length).to.equal(0);
      list = await doublylist.secondPartitionList();
      expect(list.length).to.equal(0);
      list = await doublylist.partitionList(0);
      expect(list.length).to.equal(0);
      list = await doublylist.partitionListGivenToLast(0);
      expect(list.length).to.equal(0);
    });

    it("[UNHAPPY] the index not found in list", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true });
      let list = await doublylist.partitionList(11);
      expect(list.length).to.equal(0);
      list = await doublylist.partitionListGivenToLast(11);
      expect(list.length).to.equal(0);
    });
  });
};
