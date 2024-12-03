import * as General from "./General.test";
import * as CalculationEpoch from "./CalculationEpoch.test";
import * as CalculationFrame from "./CalculationWindow.test";
import * as CalculationSafeFrame from "./CalculationSafeWindow.test";

export const run = async () => {
  describe("BlockBasedLazySlidingWindow", async function () {
    CalculationEpoch.run();
    CalculationFrame.run();
    CalculationSafeFrame.run();
    General.run();
  });
};
