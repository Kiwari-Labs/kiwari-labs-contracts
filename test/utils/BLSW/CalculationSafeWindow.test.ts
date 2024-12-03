import {expect} from "chai";
import {deployBLSW} from "./utils.test";
import {network} from "hardhat";
import { skipToBlock } from "../../utils.test";

export const run = async () => {
  describe("CalculationSafeFrame", async function () {
    beforeEach(async function () {
      await network.provider.send("hardhat_reset");
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the first epoch of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the second epoch of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the third epoch of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the fourth epoch of the first epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the first epoch of the second epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the second epoch of the second epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the third epoch of the second epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the fourth epoch of the second epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the first epoch of the third epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the second epoch of the third epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the third epoch of the third epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if the current block is in the fourth epoch of the third epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if window size equal to 3 and window size equal to 4", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if window size equal to 3 and window size equal to 4 when the window is in between both epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if window size equal to window size", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if window size equal to window size when the window is in between both epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if window size equal to 5 and window size equal to 4", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if window size equal to 5 and window size equal to 4 when the current block is in third epoch", async function () {
      // TODO
    });

    it("[HAPPY] calculate correctly safe window if window size equal to 3 and window size equal to 5", async function () {
      // TODO
    });
  });
};
