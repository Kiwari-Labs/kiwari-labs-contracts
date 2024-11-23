import * as General from "./General.test";
import * as CalculationEpochAndSlot from "./CalculationEpochAndSlot.test";
import * as CalculationFrame from "./CalculationFrame.test";
import * as CalculationSafeFrame from "./CalculationSafeFrame.test";

export const run = async () => {
  describe("LightWeightSlidingWindow", async function () {
    General.run();
    CalculationEpochAndSlot.run();
    CalculationFrame.run();
    CalculationSafeFrame.run();
  });
};
