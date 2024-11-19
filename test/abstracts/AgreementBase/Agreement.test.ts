import {expect} from "chai";
import {deployAgreementBase} from "./utils.test";
import {AgreementBase} from "../../constant.test";
import {AbiCoder} from "@ethersproject/abi";

export const run = async () => {
  describe("Agreement", async function () {
    let abiCoder = new AbiCoder();

    it("[HAPPY] verifyAgreement successful", async function () {
      const {agreementBase} = await deployAgreementBase(AgreementBase.constructor.name);
      const payload = abiCoder.encode(["bool"], [true]);
      const respond = await agreementBase.callStatic.verifyAgreement(payload, payload);
      expect(respond).to.equal(true);
    });

    it("[UNHAPPY] verifyAgreement unsuccessful", async function () {
      const {agreementBase} = await deployAgreementBase(AgreementBase.constructor.name);
      const payload = abiCoder.encode(["bool"], [false]);
      const respond = await agreementBase.callStatic.verifyAgreement(payload, payload);
      expect(respond).to.equal(false);
    });

    it("[HAPPY] agreement successful", async function () {
      const {agreementBase} = await deployAgreementBase(AgreementBase.constructor.name);
      const payload = abiCoder.encode(["bool"], [true]);
      const respond = await agreementBase.callStatic.agreement(payload, payload);
      expect(respond).to.equal(true);
      await expect(agreementBase.agreement(payload, payload)).to.emit(
        agreementBase,
        AgreementBase.events.AgreementComplete,
      );
    });

    it("[UNHAPPY] agreement unsuccessful", async function () {
      const {agreementBase} = await deployAgreementBase(AgreementBase.constructor.name);
      const payload = abiCoder.encode(["bool"], [false]);
      await expect(agreementBase.agreement(payload, payload))
        .to.be.revertedWithCustomError(agreementBase, AgreementBase.errors.AgreementFailed)
        .withArgs(payload, payload);
    });
  });
};
