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
      // Because in terms of actual implementation, we can not return the node at a position of 2.5.
      expect(await doublylist.middle()).to.equal(2);
    });

    it("[HAPPY] correct query guard", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      const guard = await doublylist.guard();
      expect(guard[0]).to.equal(5); // Head of _SENTINEL.
      expect(guard[1]).to.equal(1); // Tail of _SENTINEL.
    });

    it("[HAPPY] correct query first parition", async function () {
      const { doublylist } = await deployDoublyList({ autoList: true, len: 5 });
      // [1, 2, 3, 4, 5] => [1, 2]
      const list = await doublylist.firstParitionList();
      expect(list.length).to.equal(2);
      for (let i = 0; i < list.length; i++) {
        expect(list[i]).to.equal(i + 1);
      }
    });

    it("[HAPPY] correct query second parition", async function () {
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
  });
};
