import { expect } from "chai";
import { deployDoublyList, padIndexToData } from "../utils.test";
import { data as mockData }from "../../mocks/data/shuffle_270_number";

export const run = async () => {
  describe("Insertion", async function () {
    it("[HAPPY] correct one insertion", async function () {
      const { doublylist } = await deployDoublyList();
      const index = 1;
      const data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      expect(await doublylist.size()).to.equal(1);
    });

    it("[HAPPY] correct multi insertion", async function () {
      const { doublylist } = await deployDoublyList();

      const len = 10;
      for (let i = 0; i < len; i++) {
        const index = i + 1;
        const data = padIndexToData(index);
        await doublylist.insert(index, data);
        expect(await doublylist.exist(index)).to.equal(true);
      }
      expect(await doublylist.size()).to.equal(len);
    });

    it("[HAPPY] correct multi insertion shuffle", async function () {
      const { doublylist } = await deployDoublyList();
      for (let i = 0; i <= mockData.length; i++) {
        const index = i + 1;
        const data = padIndexToData(index);
        await doublylist.insert(i, data);
        expect(await doublylist.exist(i)).to.equal(true);
      }
      expect(await doublylist.size()).to.equal(mockData.length);
    });

    it("[HAPPY] correct insertion at the head", async function () {
      const { doublylist } = await deployDoublyList();

      let index = 2;
      let data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      expect(await doublylist.head()).to.equal(2);

      index = 1;
      data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      expect(await doublylist.tail()).to.equal(2);
    });

    it("[HAPPY] correct insertion at the tail", async function () {
      const { doublylist } = await deployDoublyList();

      let index = 1;
      let data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      expect(await doublylist.tail()).to.equal(1);

      index = 2;
      data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      expect(await doublylist.tail()).to.equal(2);
    });

    it("[HAPPY] correct insertion between head and tail", async function () {
      const { doublylist } = await deployDoublyList();

      let index = 1;
      let data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);

      index = 3;
      data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);

      index = 2;
      data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);

      expect(await doublylist.head()).to.equal(1);

      const node = await doublylist.node(2);
      expect(node.prev).to.equal(1);
      expect(node.next).to.equal(3);

      expect(await doublylist.tail()).to.equal(3);
    });

    it("[UNHAPPY] the index must be more than 1", async function () {
      const { doublylist } = await deployDoublyList();

      // The index 0 is reserved for _SENTINEL.
      const index = 0;
      const data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.size()).to.equal(0);
    });

    it("[UNHAPPY] the index must not be duplicated", async function () {
      const { doublylist } = await deployDoublyList();
      let index = 1;
      let data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.size()).to.equal(1);

      // Skip insert when the index already exists.
      index = 1;
      data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.size()).to.equal(1);
    });
  });
};
