import * as AgreementBase from "./AgreementBase/index.test";
import * as BilateralAgreementBase from "./BilateralAgreementBase/index.test";
import * as LightWeightSlidingWindow from "./LightWeightSlidingWindow/index.test";
import * as SlidingWindow from "./SlidingWindow/index.test";

export const run = async () => {
  describe("abstracts", async function () {
    AgreementBase.run();
    BilateralAgreementBase.run();
    LightWeightSlidingWindow.run();
    SlidingWindow.run();
  });
};
