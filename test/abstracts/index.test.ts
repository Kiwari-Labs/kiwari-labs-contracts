import * as ERC20EXPBase from "./ERC20EXPBase/index.test";
import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
import * as SlidingWindow from "./SlidingWindow/index.test";

export const run = async () => {
  describe("abstracts", async function () {
    ERC20EXPBase.run()
    LightWeightSlidingWindow.run();
    SlidingWindow.run();
  });
};
