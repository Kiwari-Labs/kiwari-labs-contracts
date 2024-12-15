import {expect} from "chai";
import {hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("Remove", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] remove front", async function () {
      // @TODO
    });

    it("[SUCCESS] remove back", async function () {
      // @TODO
    });

    it("[SUCCESS] remove between front and back", async function () {
      // @TODO
    });

    it("[FAILED] remove the non-exist element", async function () {
      // @TODO
    });
  });
};
