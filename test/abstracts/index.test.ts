import * as AgreementBase from "./AgreementBase/index.test";
import * as ERC20EXPBase from "./ERC20EXPBase/index.test";
import * as LightWeightERC20EXPBase from "./LightWeightERC20EXPBase/index.test";
import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
import * as SlidingWindow from "./SlidingWindow/index.test";

export const run = async () => {
  describe("abstracts", async function () {
    AgreementBase.run();
    // ERC20EXPBase.run();
    // LightWeightERC20EXPBase.run();
    // LightWeightSlidingWindow.run();
    // SlidingWindow.run();
  });
};
