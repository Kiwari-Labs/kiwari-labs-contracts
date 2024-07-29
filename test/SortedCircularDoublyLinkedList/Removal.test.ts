import {expect} from "chai";
import {deployDoublyList, padIndexToData} from "../utils.test";

export const run = async () => {
  describe("Removal", async function () {
    it("[HAPPY] remove correctly", async function () {
      const {doublylist} = await deployDoublyList();

      const index = 1;
      const data = padIndexToData(index);
      await doublylist.insert(index, data);
      expect(await doublylist.exist(index)).to.equal(true);
      await doublylist.remove(index);
      expect(await doublylist.exist(index)).to.equal(false);
      expect(await doublylist.size()).to.equal(0);
    });

    it("[HAPPY] remove correctly from the head", async function () {
      const {doublylist} = await deployDoublyList({autoList: true});

      const head = await doublylist.head();
      const size = await doublylist.size();
      expect(await doublylist.exist(head)).to.equal(true);
      await doublylist.remove(head);
      expect(await doublylist.exist(head)).to.equal(false);
      expect(await doublylist.size()).to.equal(size.sub(1));
      const list = await doublylist.ascending();
      for (let i = 0; i < 9; i++) {
        expect(list[i]).to.equal(i + 2);
      }
      const node = await doublylist.node(1);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
      expect(node.data).to.equal("0x");
    });

    it("[HAPPY] remove correctly of a node", async function () {
      const {doublylist} = await deployDoublyList({autoList: true});

      const index = 5;
      const size = await doublylist.size();
      expect(await doublylist.exist(index)).to.equal(true);
      await doublylist.remove(index);
      expect(await doublylist.exist(index)).to.equal(false);
      expect(await doublylist.size()).to.equal(size.sub(1));
      const list = await doublylist.ascending();
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
      const {doublylist} = await deployDoublyList({autoList: true});

      const tail = await doublylist.tail();
      const size = await doublylist.size();
      expect(await doublylist.exist(tail)).to.equal(true);
      await doublylist.remove(tail);
      expect(await doublylist.exist(tail)).to.equal(false);
      expect(await doublylist.size()).to.equal(size.sub(1));
      const list = await doublylist.ascending();
      for (let i = 0; i < 9; i++) {
        expect(list[i]).to.equal(i + 1);
      }
    });

    it("[UNHAPPY] unable to remove unreal index", async function () {
      const {doublylist} = await deployDoublyList();
      await doublylist.remove(1);
      expect(await doublylist.size()).to.equal(0);
    });
  });
};
