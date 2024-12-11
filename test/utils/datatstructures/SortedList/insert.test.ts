import {expect} from "chai";
import {hardhat_reset} from "../../../utils.test";

export const run = async () => {
  describe("Insert", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] insert before front", async function () {
      // @TODO
    });

    it("[SUCCESS] insert after back", async function () {
      // @TODO
    });

    it("[SUCCESS] insert between front and back", async function () {
      // @TODO
    });

    it("[FAILED] insert the exist element", async function () {
      // @TODO
    });
  });
};
