import {expect} from "chai";
import { deployLightWeightDoublyListLibraryV2 } from "./utils.test";

export const run = async () => {
  describe("Integration", async function () {
    it("[HAPPY] integration correctly", async function () {
      const len = 10;
      const {lightWeightDoublyListV2} = await deployLightWeightDoublyListLibraryV2({
        autoList: true,
        len: len,
      });

      for (let i = 0; i < len; i++) {
        const index = i + 1;
        expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);
        await lightWeightDoublyListV2.remove(index);
        expect(await lightWeightDoublyListV2.exist(index)).to.equal(false);
      }

      expect(await lightWeightDoublyListV2.size()).to.equal(0);

      for (let i = 0; i < len; i++) {
        const index = i + 1;
        await lightWeightDoublyListV2.insert(index);
        expect(await lightWeightDoublyListV2.exist(index)).to.equal(true);
      }
    });
  });
};
