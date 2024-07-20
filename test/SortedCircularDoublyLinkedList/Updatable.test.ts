import {expect} from "chai";
import {deployDoublyList, padIndexToData} from "../utils.test";

export const run = async () => {
  describe("Updatable", async function () {
    it("[HAPPY] update correctly", async function () {
      const {doublylist} = await deployDoublyList();

      const index = 1;
      const data = padIndexToData(index);
      await doublylist.insert(index, data);
      let node = await doublylist.node(index);
      expect(node.data).to.equal(padIndexToData(index));
      await doublylist.updateNodeData(index, padIndexToData(index + 1));
      node = await doublylist.node(index);
      expect(node.data).to.equal(padIndexToData(index + 1));
    });

    it("[UNHAPPY] unable to update data into the unreal node", async function () {
      const {doublylist} = await deployDoublyList();

      const index = 1;
      await doublylist.updateNodeData(index, padIndexToData(index + 1));
      const node = await doublylist.node(index);
      expect(node.data).to.equal("0x");
    });
  });
};
