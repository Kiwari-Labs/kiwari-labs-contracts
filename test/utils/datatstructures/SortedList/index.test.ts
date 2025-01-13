import * as General from "./general.test";
import * as Insert from "./insert.test";
import * as Remove from "./remove.test";
import * as Shrink from "./shrink.test";

export const run = async () => {
  describe("SortedList", async function () {
    General.run();
    Insert.run();
    Remove.run();
    Shrink.run();
  });
};
