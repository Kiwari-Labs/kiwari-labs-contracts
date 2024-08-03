import {expect} from "chai";
import {deployDoublyList, padIndexToData} from "../utils.test";

export const run = async () => {
  describe("Removal", async function () {
    it("[HAPPY] remove correctly", async function () {
      const {doublyList} = await deployDoublyList();

      const index = 1;
      const data = padIndexToData(index);
      await doublyList.insert(index, data);
      expect(await doublyList.exist(index)).to.equal(true);
      await doublyList.remove(index);
      expect(await doublyList.exist(index)).to.equal(false);
      expect(await doublyList.size()).to.equal(0);
    });

    it("[HAPPY] remove correctly from the head", async function () {
      const {doublyList} = await deployDoublyList({autoList: true});

      const head = await doublyList.head();
      const size = await doublyList.size();
      expect(await doublyList.exist(head)).to.equal(true);
      await doublyList.remove(head);
      expect(await doublyList.exist(head)).to.equal(false);
      expect(await doublyList.size()).to.equal(size.sub(1));
      const list = await doublyList.ascending();
      for (let i = 0; i < 9; i++) {
        expect(list[i]).to.equal(i + 2);
      }
      const node = await doublyList.node(1);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
      expect(node.data).to.equal("0x");
    });

    it("[HAPPY] remove correctly of a node", async function () {
      const {doublyList} = await deployDoublyList({autoList: true});

      const index = 5;
      const size = await doublyList.size();
      expect(await doublyList.exist(index)).to.equal(true);
      await doublyList.remove(index);
      expect(await doublyList.exist(index)).to.equal(false);
      expect(await doublyList.size()).to.equal(size.sub(1));
      const list = await doublyList.ascending();
      for (let i = 0; i < 9; i++) {
        // Skip index 5.
        if (i < index - 1) {
          expect(list[i]).to.equal(i + 1);
        } else {
          expect(list[i]).to.equal(i + 2);
        }
      }
    });

    it("[HAPPY] remove correctly from the tail", async function () {
      const {doublyList} = await deployDoublyList({autoList: true});

      const tail = await doublyList.tail();
      const size = await doublyList.size();
      expect(await doublyList.exist(tail)).to.equal(true);
      await doublyList.remove(tail);
      expect(await doublyList.exist(tail)).to.equal(false);
      expect(await doublyList.size()).to.equal(size.sub(1));
      const list = await doublyList.ascending();
      for (let i = 0; i < 9; i++) {
        expect(list[i]).to.equal(i + 1);
      }
    });

    it("[UNHAPPY] unable to remove unreal index", async function () {
      const {doublyList} = await deployDoublyList();
      await doublyList.remove(1);
      expect(await doublyList.size()).to.equal(0);
    });
  });
};
