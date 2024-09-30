import {expect} from "chai";
import {deployAgreementBase} from "../../utils.test";
import {
  AGREEMENT_NAME,
  EVENT_AGREEMENT_BUMP_MAJOR_VERSION,
  EVENT_AGREEMENT_BUMP_MINOR_VERSION,
  EVENT_AGREEMENT_BUMP_PATCH_VERSION,
} from "../../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] agreement name", async function () {
      const {agreementBase} = await deployAgreementBase(AGREEMENT_NAME);
      expect(await agreementBase.name()).to.equal(AGREEMENT_NAME);
    });

    it("[HAPPY] bump major version", async function () {
      const {agreementBase} = await deployAgreementBase(AGREEMENT_NAME);
      const version = await agreementBase.version();
      await expect(agreementBase.bumpMajorVersion())
        .to.emit(agreementBase, EVENT_AGREEMENT_BUMP_MAJOR_VERSION)
        .withArgs(100, 200);
      expect(await agreementBase.version()).to.equal(200);
    });

    it("[HAPPY] bump minor version", async function () {
      const {agreementBase} = await deployAgreementBase(AGREEMENT_NAME);
      await expect(agreementBase.bumpMinorVersion())
        .to.emit(agreementBase, EVENT_AGREEMENT_BUMP_MINOR_VERSION)
        .withArgs(100, 110);
      expect(await agreementBase.version()).to.equal(110);
    });

    it("[HAPPY] bump patch version", async function () {
      const {agreementBase} = await deployAgreementBase(AGREEMENT_NAME);
      await expect(agreementBase.bumpPatchVersion())
        .to.emit(agreementBase, EVENT_AGREEMENT_BUMP_PATCH_VERSION)
        .withArgs(100, 101);
      expect(await agreementBase.version()).to.equal(101);
    });
  });
};
