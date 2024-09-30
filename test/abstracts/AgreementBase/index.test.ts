import * as General from "./General.test";
import * as Agreement from "./Agreement.test";

export const run = async () => {
  describe("AgreementBase", async function () {
    General.run();
    Agreement.run();
  });
};
