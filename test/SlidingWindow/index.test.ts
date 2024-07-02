import * as General from "./General.test";
import * as CalculationEraAndSlot from "./CalculationEraAndSlot.test";
import * as CalculationFrame from "./CalculationFrame.test";
import * as CalculationSafeFrame from "./CalculationSafeFrame.test";

export const run = async () => {
  describe("SlidingWindow", async function () {
    General.run();
    CalculationEraAndSlot.run()
    CalculationFrame.run()
    CalculationSafeFrame.run()
  });
};
