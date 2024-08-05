import {expect} from "chai";
import {deployDoublyListLibrary, padIndexToData} from "../../utils.test";
import {data as mockData} from "../../../mocks/data/shuffle_273_number";

export const run = async () => {
  describe("Insertion", async function () {
    it("[HAPPY] one insert correctly", async function () {
      const {doublyList} = await deployDoublyListLibrary();
      const index = 1;
      const data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.exist(index)).to.equal(true);
      expect(await doublyList.size()).to.equal(1);
    });

    it("[HAPPY] multi insert correctly", async function () {
      const {doublyList} = await deployDoublyListLibrary();

      const len = 10;
      for (let i = 0; i < len; i++) {
        const index = i + 1;
        const data = padIndexToData(index);
        await doublyList.insert(index, data);
        expect(await doublyList.exist(index)).to.equal(true);
      }
      expect(await doublyList.size()).to.equal(len);
    });

    it("[HAPPY] shuffle insertion correctly", async function () {
      const {doublyList} = await deployDoublyListLibrary();
      for (let i = 0; i < mockData.length; i++) {
        const index = i + 1;
        const data = padIndexToData(index);
        await doublyList.insert(mockData[i], data);
        expect(await doublyList.exist(mockData[i])).to.equal(true);
      }
      expect(await doublyList.size()).to.equal(mockData.length);
    });

    it("[HAPPY] insert correctly at the head", async function () {
      const {doublyList} = await deployDoublyListLibrary();

      let index = 2;
      let data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.exist(index)).to.equal(true);
      expect(await doublyList.head()).to.equal(2);

      index = 1;
      data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.exist(index)).to.equal(true);
      expect(await doublyList.tail()).to.equal(2);
    });

    it("[HAPPY] insert correctly at the tail", async function () {
      const {doublyList} = await deployDoublyListLibrary();

      let index = 1;
      let data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.exist(index)).to.equal(true);
      expect(await doublyList.tail()).to.equal(1);

      index = 2;
      data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.exist(index)).to.equal(true);
      expect(await doublyList.tail()).to.equal(2);
    });

    it("[HAPPY] insert correctly between head and tail", async function () {
      const {doublyList} = await deployDoublyListLibrary();

      let index = 1;
      let data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.exist(index)).to.equal(true);

      index = 3;
      data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.exist(index)).to.equal(true);

      index = 2;
      data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.exist(index)).to.equal(true);

      expect(await doublyList.head()).to.equal(1);

      const node = await doublyList.node(2);
      expect(node.prev).to.equal(1);
      expect(node.next).to.equal(3);

      expect(await doublyList.tail()).to.equal(3);
    });

    it("[UNHAPPY] the index must be more than 1", async function () {
      const {doublyList} = await deployDoublyListLibrary();

      // The index 0 is reserved for _SENTINEL.
      const index = 0;
      const data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.size()).to.equal(0);
    });

    it("[UNHAPPY] the index must not be duplicated", async function () {
      const {doublyList} = await deployDoublyListLibrary();
      let index = 1;
      let data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.size()).to.equal(1);

      // Skip insert when the index already exists.
      index = 1;
      data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.size()).to.equal(1);
    });
  });
};
