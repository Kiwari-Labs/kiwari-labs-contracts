import * as General from "./General.test";
import * as Insertion from "./Insertion.test";
import * as Sorting from "./Sorting.test";
import * as Updatable from "./Updatable.test";
import * as Removal from "./Removal.test";
import * as Integration from "./Integration.test";

export const run = async () => {
  describe("SortedCircularDoublyLinkedList", async function () {
    General.run();
    Insertion.run();
    Sorting.run();
    Updatable.run();
    Removal.run();
    Integration.run();
  });
};
