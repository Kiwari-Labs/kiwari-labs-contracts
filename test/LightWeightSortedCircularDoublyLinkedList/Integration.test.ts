import {expect} from "chai";
import {deployLightWeightDoublyList} from "../utils.test";

export const run = async () => {
  describe("Integration", async function () {
    it("[HAPPY] integration correctly", async function () {
      const len = 10;
      const {doublylist} = await deployLightWeightDoublyList({
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
        await doublylist.insert(index);
        expect(await doublylist.exist(index)).to.equal(true);
      }
    });
  });
};
