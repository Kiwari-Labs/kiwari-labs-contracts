import * as Interface from "./interface.test";
import * as TransferAtEpoch from "./transferAtEpoch.test";
import * as TransferFromAtEpoch from "./transferFromAtEpoch.test";

export const run = async () => {
  describe("ERC7818", async function () {
    Interface.run();
    TransferAtEpoch.run();
    TransferFromAtEpoch.run();
  });
};
