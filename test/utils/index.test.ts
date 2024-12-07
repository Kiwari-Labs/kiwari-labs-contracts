import * as BLSW from "./algorithms/BLSW/index.test";
import * as Comparators from "./comparators/index.test";
import * as PU128SCDLL from "./datatstructures/PU128SCDLL/index.test";
import * as SCDLL from "./datatstructures/SCDLL/index.test";
import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
import * as SlidingWindow from "./SlidingWindow/index.test";

export const run = async () => {
  describe("utils", async function () {
    Comparators.run();
    BLSW.run();
    // PU128SCDLL.run();
    // SCDLL.run();
  });
};
