import {expect} from "chai";

import {data as mockData} from "../../../mocks/data/shuffle_273_number";
import { deployLightWeightDoublyListLibrary } from "./utils.test";

export const run = async () => {
  describe("Insertion", async function () {
    it("[HAPPY] one insert correctly", async function () {
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();
      const index = 1;
      await lightWeightDoublyList.insert(index);
      expect(await lightWeightDoublyList.exist(index)).to.equal(true);
      expect(await lightWeightDoublyList.size()).to.equal(1);
    });

    // it("[HAPPY] multi insert correctly", async function () {
    //   const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();

    //   const len = 10;
    //   for (let i = 0; i < len; i++) {
    //     const index = i + 1;
    //     await lightWeightDoublyList.insert(index);
    //     expect(await lightWeightDoublyList.exist(index)).to.equal(true);
    //   }
    //   expect(await lightWeightDoublyList.size()).to.equal(len);
    // });

    it("[HAPPY] shuffle insertion correctly", async function () {
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();
      for (let i = 0; i < mockData.length; i++) {
        await lightWeightDoublyList.insert(mockData[i]);
        expect(await lightWeightDoublyList.exist(mockData[i])).to.equal(true);
      }
      expect(await lightWeightDoublyList.size()).to.equal(mockData.length);
    });

    // it("[HAPPY] insert correctly at the head", async function () {
    //   const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();

    //   let index = 2;

    //   await lightWeightDoublyList.insert(index);
    //   expect(await lightWeightDoublyList.exist(index)).to.equal(true);
    //   expect(await lightWeightDoublyList.head()).to.equal(2);

    //   index = 1;

    //   await lightWeightDoublyList.insert(index);
    //   expect(await lightWeightDoublyList.exist(index)).to.equal(true);
    //   expect(await lightWeightDoublyList.tail()).to.equal(2);
    // });

    // it("[HAPPY] insert correctly at the tail", async function () {
    //   const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();

    //   let index = 1;
    //   await lightWeightDoublyList.insert(index);
    //   expect(await lightWeightDoublyList.exist(index)).to.equal(true);
    //   expect(await lightWeightDoublyList.tail()).to.equal(1);

    //   index = 2;
    //   await lightWeightDoublyList.insert(index);
    //   expect(await lightWeightDoublyList.exist(index)).to.equal(true);
    //   expect(await lightWeightDoublyList.tail()).to.equal(2);
    // });

    // it("[HAPPY] insert correctly between head and tail", async function () {
    //   const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();

    //   let index = 1;
    //   await lightWeightDoublyList.insert(index);
    //   expect(await lightWeightDoublyList.exist(index)).to.equal(true);

    //   index = 3;
    //   await lightWeightDoublyList.insert(index);
    //   expect(await lightWeightDoublyList.exist(index)).to.equal(true);

    //   index = 2;
    //   await lightWeightDoublyList.insert(index);
    //   expect(await lightWeightDoublyList.exist(index)).to.equal(true);

    //   expect(await lightWeightDoublyList.head()).to.equal(1);

    //   const node = await lightWeightDoublyList.node(2);
    //   expect(node.prev).to.equal(1);
    //   expect(node.next).to.equal(3);

    //   expect(await lightWeightDoublyList.tail()).to.equal(3);
    // });

    // it("[UNHAPPY] the index must be more than 1", async function () {
    //   const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();

    //   // The index 0 is reserved for _SENTINEL.
    //   const index = 0;
    //   await lightWeightDoublyList.insert(index);
    //   expect(await lightWeightDoublyList.size()).to.equal(0);
    // });

    // it("[UNHAPPY] the index must not be duplicated", async function () {
    //   const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();
    //   let index = 1;

    //   await lightWeightDoublyList.insert(index);
    //   expect(await lightWeightDoublyList.size()).to.equal(1);

    //   // Skip insert when the index already exists.
    //   index = 1;

    //   await lightWeightDoublyList.insert(index);
    //   expect(await lightWeightDoublyList.size()).to.equal(1);
    // });
  });
};
