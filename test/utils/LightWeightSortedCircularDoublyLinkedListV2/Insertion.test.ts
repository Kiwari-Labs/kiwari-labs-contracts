import {expect} from "chai";

import {data as mockData} from "../../../mocks/data/shuffle_273_number";
import {deployLightWeightDoublyListLibraryV2} from "./utils.test";

export const run = async () => {
  describe("Insertion", async function () {
    it("[HAPPY] one insert correctly", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();
      const index = 1;
      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);
      expect(await lightWeightDoublyListV2.size()).to.equal(1);
    });

    it("[HAPPY] multi insert correctly", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();

      const len = 10;
      for (let i = 0; i < len; i++) {
        const index = i + 1;
        await lightWeightDoublyListV2.insert(index);
        expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);
      }
      expect(await lightWeightDoublyListV2.size()).to.equal(len);
    });

    it("[HAPPY] shuffle insertion correctly", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();
      for (let i = 0; i < mockData.length; i++) {
        await lightWeightDoublyListV2.insert(mockData[i]);
        expect(await lightWeightDoublyListV2.exist(mockData[i])).to.equal(true);
      }
      expect(await lightWeightDoublyListV2.size()).to.equal(mockData.length);
      // console.log(await lightWeightDoublyListV2.ascending());
    });

    it("[HAPPY] insert correctly at the head", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();

      let index = 2;

      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);
      expect(await lightWeightDoublyListV2.head()).to.equal(2);

      index = 1;

      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);
      expect(await lightWeightDoublyListV2.tail()).to.equal(2);
    });

    it("[HAPPY] insert correctly at the tail", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();

      let index = 1;
      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);
      expect(await lightWeightDoublyListV2.tail()).to.equal(1);

      index = 2;
      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);
      expect(await lightWeightDoublyListV2.tail()).to.equal(2);
    });

    it("[HAPPY] insert correctly between head and tail", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();

      let index = 1;
      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);

      index = 3;
      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);

      index = 2;
      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);

      expect(await lightWeightDoublyListV2.head()).to.equal(1);

      const node = await lightWeightDoublyListV2.node(2);
      expect(node.prev).to.equal(1);
      expect(node.next).to.equal(3);

      expect(await lightWeightDoublyListV2.tail()).to.equal(3);
    });

    it("[UNHAPPY] the index must be more than 1", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();

      // The index 0 is reserved for _SENTINEL.
      const index = 0;
      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.size()).to.equal(0);
    });

    it("[UNHAPPY] the index must not be duplicated", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();
      let index = 1;

      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.size()).to.equal(1);

      // Skip insert when the index already exists.
      index = 1;

      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.size()).to.equal(1);
    });
  });
};
