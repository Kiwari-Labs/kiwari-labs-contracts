import {expect} from "chai";
import {deployLightWeightDoublyListLibrary} from "./utils.test";

export const run = async () => {
  describe("Removal", async function () {
    it("[HAPPY] remove correctly", async function () {
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();

      const index = 1;
      await lightWeightDoublyList.insert(index);
      expect(await lightWeightDoublyList.exist(index)).to.equal(true);
      await lightWeightDoublyList.remove(index);
      expect(await lightWeightDoublyList.exist(index)).to.equal(false);
      expect(await lightWeightDoublyList.size()).to.equal(0);
    });

    it("[HAPPY] remove correctly from the head", async function () {
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary({
        autoList: true,
      });

      const head = await lightWeightDoublyList.head();
      const size = await lightWeightDoublyList.size();
      expect(await lightWeightDoublyList.exist(head)).to.equal(true);
      await lightWeightDoublyList.remove(head);
      expect(await lightWeightDoublyList.exist(head)).to.equal(false);
      expect(await lightWeightDoublyList.size()).to.equal(size.sub(1));
      const list = await lightWeightDoublyList.ascending();
      for (let i = 0; i < 9; i++) {
        expect(list[i]).to.equal(i + 2);
      }
      const node = await lightWeightDoublyList.node(1);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
    });

    it("[HAPPY] remove correctly of a node", async function () {
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary({
        autoList: true,
      });

      const index = 5;
      const size = await lightWeightDoublyList.size();
      expect(await lightWeightDoublyList.exist(index)).to.equal(true);
      await lightWeightDoublyList.remove(index);
      expect(await lightWeightDoublyList.exist(index)).to.equal(false);
      expect(await lightWeightDoublyList.size()).to.equal(size.sub(1));
      const list = await lightWeightDoublyList.ascending();
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
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary({
        autoList: true,
      });

      const tail = await lightWeightDoublyList.tail();
      const size = await lightWeightDoublyList.size();
      expect(await lightWeightDoublyList.exist(tail)).to.equal(true);
      await lightWeightDoublyList.remove(tail);
      expect(await lightWeightDoublyList.exist(tail)).to.equal(false);
      expect(await lightWeightDoublyList.size()).to.equal(size.sub(1));
      const list = await lightWeightDoublyList.ascending();
      for (let i = 0; i < 9; i++) {
        expect(list[i]).to.equal(i + 1);
      }
    });

    it("[UNHAPPY] unable to remove unreal index", async function () {
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary();
      await lightWeightDoublyList.remove(1);
      expect(await lightWeightDoublyList.size()).to.equal(0);
    });
  });
};
