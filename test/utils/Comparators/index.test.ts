import * as AddressComparator from "./AddressComparator.test";
import * as BooleanComparator from "./BooleanOperation.test";
import * as IntComparator from "./IntComparator.test";
import * as UintComparator from "./UintComparator.test";
import * as TimeComparator from "./TimeComparator.test";

export const run = async () => {
  describe("Utilities Comparator", async function () {
    AddressComparator.run();
    BooleanComparator.run();
    IntComparator.run();
    UintComparator.run();
    TimeComparator.run();
  });
};
