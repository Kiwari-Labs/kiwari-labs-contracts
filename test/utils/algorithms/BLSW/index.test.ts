import * as General from "./general.test";
import * as Epoch from "./epoch.test";
import * as WindowRange from "./windowRange.test";
import * as SafeWindowRange from "./safeWindowRange.test";

export const run = async () => {
  describe.only("Block-based Lazy Sliding Window (BLSW)", async function () {
    General.run();
    Epoch.run();
    WindowRange.run();
    SafeWindowRange.run();
  });
};
