import { expect } from "chai";
import { deployDoublyList, padIndexToData } from "../utils.test";

export const run = async () => {
  describe("Integration", async function () {
    it("[HAPPY] correct integration", async function () {
      const len = 10;
      const { doublylist } = await deployDoublyList({
        autoList: true,
        len: len,
      });

      for (let i = 0; i < len; i++) {
        const index = i + 1;
        expect(await doublylist.exist(index)).to.equal(true);
        await doublylist.remove(index);
        expect(await doublylist.exist(index)).to.equal(false);
      }

      expect(await doublylist.size()).to.equal(0);

      for (let i = 0; i < len; i++) {
        const index = i + 1;
        const data = padIndexToData(index);
        await doublylist.insert(index, data);
        expect(await doublylist.exist(index)).to.equal(true);
      }
    });
  });
};
