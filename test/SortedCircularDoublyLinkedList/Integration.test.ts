import {expect} from "chai";
import {deployDoublyList, padIndexToData} from "../utils.test";

export const run = async () => {
  describe("Integration", async function () {
    it("[HAPPY] integration correctly", async function () {
      const len = 10;
      const {doublyList} = await deployDoublyList({
        autoList: true,
        len: len,
      });

      for (let i = 0; i < len; i++) {
        const index = i + 1;
        expect(await doublyList.exist(index)).to.equal(true);
        await doublyList.remove(index);
        expect(await doublyList.exist(index)).to.equal(false);
      }

      expect(await doublyList.size()).to.equal(0);

      for (let i = 0; i < len; i++) {
        const index = i + 1;
        const data = padIndexToData(index);
        await doublyList.insert(index, data);
        expect(await doublyList.exist(index)).to.equal(true);
      }
    });
  });
};
