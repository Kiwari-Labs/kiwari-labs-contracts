import {expect} from "chai";
import {hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("Insert", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });
  });
};
