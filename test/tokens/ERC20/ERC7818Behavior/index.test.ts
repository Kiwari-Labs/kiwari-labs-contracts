import * as Interface from "./interface.test";
import * as MintToEpoch from "./mintToEpoch.test";
import * as BurnFromEpoch from "./burnFromEpoch.test";
import * as TransferAtEpoch from "./transferAtEpoch.test";
import * as TransferFromAtEpoch from "./transferFromAtEpoch.test";

export const run = async () => {
  describe("ERC7818", async function () {
    Interface.run();
    MintToEpoch.run();
    BurnFromEpoch.run();
    TransferAtEpoch.run();
    TransferFromAtEpoch.run();
  });
};
