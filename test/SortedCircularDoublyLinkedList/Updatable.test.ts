import {expect} from "chai";
import {deployDoublyList, padIndexToData} from "../utils.test";

export const run = async () => {
  describe("Updatable", async function () {
    it("[HAPPY] update correctly", async function () {
      const {doublyList} = await deployDoublyList();

      const index = 1;
      const data = padIndexToData(index);
      await doublyList.insert(index, data);
      let node = await doublyList.node(index);
      expect(node.data).to.equal(padIndexToData(index));
      await doublyList.updateNodeData(index, padIndexToData(index + 1));
      node = await doublyList.node(index);
      expect(node.data).to.equal(padIndexToData(index + 1));
    });

    it("[UNHAPPY] unable to update data into the unreal node", async function () {
      const {doublyList} = await deployDoublyList();

      const index = 1;
      await doublyList.updateNodeData(index, padIndexToData(index + 1));
      const node = await doublyList.node(index);
      expect(node.data).to.equal("0x");
    });
  });
};
