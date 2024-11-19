import {expect} from "chai";
import {deployLightWeightDoublyListLibrary} from "./utils.test";

export const run = async () => {
  describe("Integration", async function () {
    it("[HAPPY] integration correctly", async function () {
      const len = 10;
      const {lightWeightDoublyList} = await deployLightWeightDoublyListLibrary({
        autoList: true,
        len: len,
      });

      for (let i = 0; i < len; i++) {
        const index = i + 1;
        expect(await lightWeightDoublyList.exist(index)).to.equal(true);
        await lightWeightDoublyList.remove(index);
        expect(await lightWeightDoublyList.exist(index)).to.equal(false);
      }

      expect(await lightWeightDoublyList.size()).to.equal(0);

      for (let i = 0; i < len; i++) {
        const index = i + 1;
        await lightWeightDoublyList.insert(index);
        expect(await lightWeightDoublyList.exist(index)).to.equal(true);
      }
    });
  });
};
