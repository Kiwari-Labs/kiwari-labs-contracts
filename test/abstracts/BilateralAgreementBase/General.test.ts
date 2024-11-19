import {expect} from "chai";
import {deployAgreementBase} from "../AgreementBase/utils.test";
import {deployBilateralAgreementBase} from "./utils.test";
import {AgreementBase} from "../../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] bilateral agreement implementation", async function () {
      const {agreementBase, alice, bob} = await deployAgreementBase(AgreementBase.constructor.name);
      const {bilateralAgreementBase} = await deployBilateralAgreementBase(
        [await alice.getAddress(), await bob.getAddress()],
        agreementBase.address,
      );
      expect(await bilateralAgreementBase.implementation()).to.equal(agreementBase.address);
    });

    it("[HAPPY] bilateral agreement name", async function () {
      const {agreementBase, alice, bob} = await deployAgreementBase(AgreementBase.constructor.name);
      const {bilateralAgreementBase} = await deployBilateralAgreementBase(
        [await alice.getAddress(), await bob.getAddress()],
        agreementBase.address,
      );
      expect(await bilateralAgreementBase.name()).to.equal(AgreementBase.constructor.name);
    });

    it("[HAPPY] bilateral agreement version", async function () {
      const {agreementBase, alice, bob} = await deployAgreementBase(AgreementBase.constructor.name);
      const {bilateralAgreementBase} = await deployBilateralAgreementBase(
        [await alice.getAddress(), await bob.getAddress()],
        agreementBase.address,
      );
      expect(await bilateralAgreementBase.version()).to.equal(100);
    });

    it("[HAPPY] bilateral agreement status", async function () {
      const {agreementBase, alice, bob} = await deployAgreementBase(AgreementBase.constructor.name);
      const {bilateralAgreementBase} = await deployBilateralAgreementBase(
        [await alice.getAddress(), await bob.getAddress()],
        agreementBase.address,
      );
      // init transaction always return true
      expect(await bilateralAgreementBase.status()).to.equal(true);
    });
  });
};
