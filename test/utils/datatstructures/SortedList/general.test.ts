import {expect} from "chai";
import {hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("General", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] contains", async function () {
      // @TODO
    });

    it("[SUCCESS] previous", async function () {
      // @TODO
    });

    it("[SUCCESS] next", async function () {
      // @TODO
    });

    it("[FAILED] toArray", async function () {
      // @TODO
    });
  });
};
