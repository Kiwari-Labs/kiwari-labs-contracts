import * as LightWeightSortedCircularDoublyLinkedList from "./LightWeightSortedCircularDoublyLinkedList/index.test";
import * as LightWeightSortedCircularDoublyLinkedListV2 from "./LightWeightSortedCircularDoublyLinkedListV2/index.test";
import * as SortedCircularDoublyLinkedList from "./SortedCircularDoublyLinkedList/index.test";
import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
import * as SlidingWindow from "./SlidingWindow/index.test";
import * as Comparators from "./Comparators/index.test";

export const run = async () => {
  describe("utils", async function () {
    LightWeightSortedCircularDoublyLinkedList.run();
    LightWeightSortedCircularDoublyLinkedListV2.run();
    SortedCircularDoublyLinkedList.run();
    LightWeightSlidingWindow.run();
    SlidingWindow.run();
    Comparators.run();
  });
};
