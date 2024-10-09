import * as ApproveAgreement from "./ApproveAgreement.test";
import * as ApproveChange from "./ApproveChange.test";
import * as General from "./General.test";
import * as RejectTransaction from "./RejectTransaction.test";
import * as RevokeTransaction from "./RevokeTransaction.test";
import * as Transaction from "./Transaction.test";

export const run = async () => {
  describe("BilateralAgreementBase", async function () {
    ApproveAgreement.run();
    ApproveChange.run();
    General.run();
    RejectTransaction.run();
    RevokeTransaction.run();
    Transaction.run();
  });
};
