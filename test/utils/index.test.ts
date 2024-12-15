import * as BLSW from "./algorithms/BLSW/index.test";
import * as Comparators from "./comparators/index.test";
import * as SortedList from "./datatstructures/SortedList/index.test";
// import * as XortedList from "./datatstructures/XortedList/index.test";
// import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
// import * as SlidingWindow from "./SlidingWindow/index.test";

export const run = async () => {
  describe("utils", async function () {
    Comparators.run();
    BLSW.run();
    // SortedList.run();
    // XortedList.run();
  });
};
