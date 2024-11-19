import * as General from "./General.test";
import * as Insertion from "./Insertion.test";
import * as Sorting from "./Sorting.test";
import * as Removal from "./Removal.test";
import * as Integration from "./Integration.test";
import * as Shrink from "./Shrink.test";

export const run = async () => {
  describe("LightWeightSortedCircularDoublyLinkedListV2", async function () {
    // TODO: General.run();
    Insertion.run();
    Integration.run();
    Removal.run();
    // TODO: Shrink.run();
    Sorting.run();
  });
};
