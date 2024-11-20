import {expect} from "chai";
import {deployDoublyListLibrary, padIndexToData} from "../../utils.test";

export const run = async () => {
  describe("LazyShrink", async function () {
    it("[HAPPY] lazy shrink correctly of one element", async function () {
      const {doublyList} = await deployDoublyListLibrary({
        autoList: true,
        len: 1,
      });

      // [1:head] => [1, {sentinel:head}]
      // [1]      => []

      expect(await doublyList.size()).to.equal(1);
      expect(await doublyList.head()).to.equal(1);
      expect(await doublyList.tail()).to.equal(1);

      await doublyList.lazyShrink(0);

      expect(await doublyList.size()).to.equal(0);
      expect(await doublyList.head()).to.equal(0);
      expect(await doublyList.tail()).to.equal(0);

      let list = await doublyList.ascending();
      expect(list.length).to.equal(0);

      list = await doublyList.descending();
      expect(list.length).to.equal(0);

      // Since no data has been cleaned, the data should still be in the node.
      const node = await doublyList.node(1);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
      expect(node.data).to.equal(padIndexToData(1));
    });

    it("[HAPPY] lazy shrink correctly of two element", async function () {
      const {doublyList} = await deployDoublyListLibrary({
        autoList: true,
        len: 2,
      });

      // [1:head, 2] => [1, {2:head}]
      // [1,2]       => [2]

      expect(await doublyList.size()).to.equal(2);
      expect(await doublyList.head()).to.equal(1);
      expect(await doublyList.tail()).to.equal(2);

      await doublyList.lazyShrink(2);

      expect(await doublyList.size()).to.equal(1);
      expect(await doublyList.head()).to.equal(2);
      expect(await doublyList.tail()).to.equal(2);

      let list = await doublyList.ascending();
      expect(list.length).to.equal(1);
      expect(list[0]).to.equal(2);

      list = await doublyList.descending();
      expect(list.length).to.equal(1);
      expect(list[0]).to.equal(2);

      // Since no data has been cleaned, the data should still be in the node.
      const node = await doublyList.node(1);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(2);
      expect(node.data).to.equal(padIndexToData(1));
    });

    it("[HAPPY] lazy shrink correctly of even linked list", async function () {
      const {doublyList} = await deployDoublyListLibrary({
        autoList: true,
        len: 10,
      });

      // [1:head, 2, 3, 4, 5, 6, 7, 8, 9, 10] => [1, 2, 3, 4, {5:head, 6, 7, 8, 9, 10}]
      // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]      => [5, 6, 7, 8, 9, 10]

      expect(await doublyList.size()).to.equal(10);
      expect(await doublyList.head()).to.equal(1);
      expect(await doublyList.tail()).to.equal(10);

      await doublyList.lazyShrink(5);

      expect(await doublyList.size()).to.equal(6);
      expect(await doublyList.head()).to.equal(5);
      expect(await doublyList.tail()).to.equal(10);

      let list = await doublyList.ascending();
      expect(list.length).to.equal(6);
      for (let i = 0; i < 6; i++) {
        expect(list[i]).to.equal(5 + i);
      }

      list = await doublyList.descending();
      expect(list.length).to.equal(6);
      for (let i = 0; i < 6; i++) {
        expect(list[i]).to.equal(10 - i);
      }

      // Since no data has been cleaned, the data should still be in the node.
      for (let i = 0; i < 4; i++) {
        const node = await doublyList.node(i + 1);
        expect(node.prev).to.equal(i);
        expect(node.next).to.equal(i + 2);
        expect(node.data).to.equal(padIndexToData(i + 1));
      }
    });

    it("[HAPPY] lazy shrink correctly of odd linked list", async function () {
      const {doublyList} = await deployDoublyListLibrary({
        autoList: true,
        len: 9,
      });

      // [1:head, 2, 3, 4, 5, 6, 7, 8, 9] => [1, 2, 3, 4, {5:head, 6, 7, 8, 9}]
      // [1, 2, 3, 4, 5, 6, 7, 8, 9]      => [5, 6, 7, 8, 9]

      expect(await doublyList.size()).to.equal(9);
      expect(await doublyList.head()).to.equal(1);
      expect(await doublyList.tail()).to.equal(9);

      await doublyList.lazyShrink(5);

      expect(await doublyList.size()).to.equal(5);
      expect(await doublyList.head()).to.equal(5);
      expect(await doublyList.tail()).to.equal(9);

      let list = await doublyList.ascending();
      expect(list.length).to.equal(5);
      for (let i = 0; i < 5; i++) {
        expect(list[i]).to.equal(5 + i);
      }

      list = await doublyList.descending();
      expect(list.length).to.equal(5);
      for (let i = 0; i < 5; i++) {
        expect(list[i]).to.equal(9 - i);
      }

      // Since no data has been cleaned, the data should still be in the node.
      for (let i = 0; i < 4; i++) {
        const node = await doublyList.node(i + 1);
        expect(node.prev).to.equal(i);
        expect(node.next).to.equal(i + 2);
        expect(node.data).to.equal(padIndexToData(i + 1));
      }
    });

    it("[UNHAPPY] lazy shrink correctly of empty linked list", async function () {
      const {doublyList} = await deployDoublyListLibrary({});
      await doublyList.lazyShrink(1);
      expect(await doublyList.size()).to.equal(0);
    });
  });
};
