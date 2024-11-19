import {expect} from "chai";
import {deployLightWeightDoublyListLibraryV2} from "./utils.test";

export const run = async () => {
  describe("Removal", async function () {
    it("[HAPPY] remove correctly", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();

      const index = 1;
      await lightWeightDoublyListV2.insert(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);
      await lightWeightDoublyListV2.remove(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(false);
      expect(await lightWeightDoublyListV2.size()).to.equal(0);
    });

    it("[HAPPY] remove correctly from the head", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2({
        autoList: true,
      });

      const head = await lightWeightDoublyListV2.head();
      const size = await lightWeightDoublyListV2.size();
      expect(await lightWeightDoublyListV2.exist(head)).to.equal(true);
      await lightWeightDoublyListV2.remove(head);
      expect(await lightWeightDoublyListV2.exist(head)).to.equal(false);
      expect(await lightWeightDoublyListV2.size()).to.equal(size.sub(1));
      const list = await lightWeightDoublyListV2.ascending();
      for (let i = 0; i < 9; i++) {
        expect(list[i]).to.equal(i + 2);
      }
      const node = await lightWeightDoublyListV2.node(1);
      expect(node.prev).to.equal(0);
      expect(node.next).to.equal(0);
    });

    it("[HAPPY] remove correctly of a node", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2({
        autoList: true,
      });

      const index = 5;
      const size = await lightWeightDoublyListV2.size();
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);
      await lightWeightDoublyListV2.remove(index);
      expect(await lightWeightDoublyListV2.exist(index)).to.equal(false);
      expect(await lightWeightDoublyListV2.size()).to.equal(size.sub(1));
      const list = await lightWeightDoublyListV2.ascending();
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
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2({
        autoList: true,
      });

      const tail = await lightWeightDoublyListV2.tail();
      const size = await lightWeightDoublyListV2.size();
      expect(await lightWeightDoublyListV2.exist(tail)).to.equal(true);
      await lightWeightDoublyListV2.remove(tail);
      expect(await lightWeightDoublyListV2.exist(tail)).to.equal(false);
      expect(await lightWeightDoublyListV2.size()).to.equal(size.sub(1));
      const list = await lightWeightDoublyListV2.ascending();
      for (let i = 0; i < 9; i++) {
        expect(list[i]).to.equal(i + 1);
      }
    });

    it("[UNHAPPY] unable to remove unreal index", async function () {
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2();
      await lightWeightDoublyListV2.remove(1);
      expect(await lightWeightDoublyListV2.size()).to.equal(0);
    });
  });
};
