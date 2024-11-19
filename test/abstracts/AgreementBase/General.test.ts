import {expect} from "chai";
import {deployAgreementBase} from "./utils.test";
import {AgreementBase} from "../../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] agreement name", async function () {
      const {agreementBase} = await deployAgreementBase(AgreementBase.constructor.name);
      expect(await agreementBase.name()).to.equal(AgreementBase.constructor.name);
    });

    it("[HAPPY] bump major version", async function () {
      const {agreementBase} = await deployAgreementBase(AgreementBase.constructor.name);
      await expect(agreementBase.bumpMajorVersion())
        .to.emit(agreementBase, AgreementBase.events.BumpMajorVersion)
        .withArgs(100, 200);
      expect(await agreementBase.version()).to.equal(200);
    });

    it("[HAPPY] bump minor version", async function () {
      const {agreementBase} = await deployAgreementBase(AgreementBase.constructor.name);
      await expect(agreementBase.bumpMinorVersion())
        .to.emit(agreementBase, AgreementBase.events.BumpMinorVersion)
        .withArgs(100, 110);
      expect(await agreementBase.version()).to.equal(110);
    });

    it("[HAPPY] bump patch version", async function () {
      const {agreementBase} = await deployAgreementBase(AgreementBase.constructor.name);
      await expect(agreementBase.bumpPatchVersion())
        .to.emit(agreementBase, AgreementBase.events.BumpPatchVersion)
        .withArgs(100, 101);
      expect(await agreementBase.version()).to.equal(101);
    });
  });
};
