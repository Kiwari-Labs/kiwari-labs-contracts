import * as BLSW from "./algorithms/BLSW/index.test";
import * as Comparators from "./comparators/index.test";
import * as PU128SCDLL from "./datatstructures/PU128SCDLL/index.test";
import * as SCDLL from "./datatstructures/SortedCircularDoublyLinkedList/index.test";
import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
import * as SlidingWindow from "./SlidingWindow/index.test";

export const run = async () => {
  describe("utils", async function () {
    Comparators.run();
    BLSW.run();
    // LightWeightSlidingWindow.run();
    // LightWeightSortedCircularDoublyLinkedList.run();
    // PU128SCDLL.run();
    // SlidingWindow.run();
    // SCDLL.run();
  });
};
