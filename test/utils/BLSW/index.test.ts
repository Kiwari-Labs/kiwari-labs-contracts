import * as General from "./General.test";
import * as CalculationEpoch from "./CalculationEpoch.test";
import * as CalculationFrame from "./CalculationFrame.test";
import * as CalculationSafeFrame from "./CalculationSafeFrame.test";

export const run = async () => {
  describe("BlockBasedLazySlidingWindow", async function () {
    CalculationEpoch.run();
    CalculationFrame.run();
    CalculationSafeFrame.run();
    General.run();
  });
};
