import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
import * as SlidingWindow from "./SlidingWindow/index.test";

export const run = async () => {
  describe("abstracts", async function () {
    LightWeightSlidingWindow.run();
    SlidingWindow.run();
  });
};
