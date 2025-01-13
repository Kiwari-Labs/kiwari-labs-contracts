import * as BLSW from "./algorithms/BLSW/index.test";
// import * as TLSW from "./algorithms/BLSW/index.test";
import * as SortedList from "./datatstructures/SortedList/index.test";
// import * as XortedList from "./datatstructures/XortedList/index.test";

export const run = async () => {
  describe("utils", async function () {
    BLSW.run();
    // TLSW.run();
    SortedList.run();
    // XortedList.run();
  });
};
