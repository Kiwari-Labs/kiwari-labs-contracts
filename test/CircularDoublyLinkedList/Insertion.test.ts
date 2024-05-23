import { expect } from "chai";
import { deployDoublyList } from "../utils.test";

const padData = function (index: Number) {
  // The padding is applied from the start of this string (output: 0x0001).
  return `0x${index.toString().padStart(4, "0")}`;
};

export const run = async () => {
  describe("Insertion", async function () {
    it("[HAPPY] correct one insertion", async function () {
      const { doublylist } = await deployDoublyList();
      const index = 1;
      const data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      expect(await doublylist.size()).to.equal(1);
    });

    it("[HAPPY] correct multi insertion", async function () {
      const { doublylist } = await deployDoublyList();

      const len = 10;
      for (let i = 0; i < len; i++) {
        const index = i + 1;
        const data = padData(index);
        await doublylist.insert(index, data);
        expect(await doublylist.exist(index)).to.equal(true);
      }
      expect(await doublylist.size()).to.equal(len);
    });

    it("[HAPPY] correct insertion at the head", async function () {
      const { doublylist } = await deployDoublyList();

      let index = 2;
      let data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      expect(await doublylist.head()).to.equal(2);

      index = 1;
      data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      expect(await doublylist.tail()).to.equal(2);
    });

    it("[HAPPY] correct insertion at the tail", async function () {
      const { doublylist } = await deployDoublyList();

      let index = 1;
      let data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      expect(await doublylist.tail()).to.equal(1);

      index = 2;
      data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      expect(await doublylist.tail()).to.equal(2);
    });

    it("[HAPPY] correct insertion between head and tail", async function () {
      const { doublylist } = await deployDoublyList();

      let index = 1;
      let data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);

      index = 3;
      data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);

      index = 2;
      data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);

      expect(await doublylist.head()).to.equal(1);
      
      console.log(await doublylist.node(2))
      console.log(await doublylist.guard())
      
      expect(await doublylist.tail()).to.equal(3);
    });

    it("[UNHAPPY] the index must be more than 1", async function () {
      const { doublylist } = await deployDoublyList();
      const index = 0;
      const data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.size()).to.equal(0);
    });

    it("[UNHAPPY] the index must not be duplicated", async function () {
      const { doublylist } = await deployDoublyList();
      let index = 1;
      let data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.size()).to.equal(1);

      // Skip insert when the index already exists.
      index = 1;
      data = padData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.size()).to.equal(1);
    });
  });
};
