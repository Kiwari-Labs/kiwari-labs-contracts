import * as General from "./General.test";
import * as Insertion from "./Insertion.test";
import * as Sorting from "./Sorting.test";
import * as Removal from "./Removal.test";
import * as Integration from "./Integration.test";
import * as Shrink from "./Shrink.test";
import * as LazyShrink from "./LazyShrink.test";

export const run = async () => {
  describe("LightWeightSortedCircularDoublyLinkedList", async function () {
    General.run();
    Insertion.run();
    Sorting.run();
    Removal.run();
    Integration.run();
    Shrink.run();
    LazyShrink.run();
  });
};
