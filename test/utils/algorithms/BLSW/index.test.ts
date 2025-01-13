import * as General from "./general.test";
import * as Epoch from "./epoch.test";
import * as WindowRange from "./windowRange.test";

export const run = async () => {
  describe("Block-based Lazy Sliding Window (BLSW)", async function () {
    General.run();
    Epoch.run();
    WindowRange.run();
  });
};
