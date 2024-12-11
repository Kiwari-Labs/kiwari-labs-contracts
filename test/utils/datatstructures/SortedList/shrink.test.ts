import {expect} from "chai";
import {hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("Shrink", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] shrink", async function () {
      // @TODO
    });

    it("[FAILED] shrink the non-exist element", async function () {
      // @TODO
    });

    it("[FAILED] shrink the ignore element", async function () {
      // @TODO
    });
  });
};
