import * as LightWeightSortedCircularDoublyLinkedList from "./LightWeightSortedCircularDoublyLinkedList/index.test";
import * as SortedCircularDoublyLinkedList from "./SortedCircularDoublyLinkedList/index.test";
import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
import * as SlidingWindow from "./SlidingWindow/index.test";

export const run = async () => {
  describe("libraries", async function () {
    LightWeightSortedCircularDoublyLinkedList.run();
    SortedCircularDoublyLinkedList.run();
    LightWeightSlidingWindow.run();
    SlidingWindow.run();
  });
};
