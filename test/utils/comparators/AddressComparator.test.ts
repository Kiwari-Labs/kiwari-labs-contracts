import {expect} from "chai";
import {deployComparatorLibrary} from "./utils.test";
import {common} from "../../constant.test";

export const run = async () => {
  describe("Address Comparator", async function () {
    it("[SUCCESS] address equal", async function () {
      const {comparator, alice} = await deployComparatorLibrary({});

      expect(await comparator.addressEqual(alice.address, alice.address)).to.equal(true);
    });

    it("[FAILED] address equal", async function () {
      const {comparator, alice, bob} = await deployComparatorLibrary({});

      expect(await comparator.addressEqual(alice.address, bob.address)).to.equal(false);
    });

    it("[SUCCESS] address not equal", async function () {
      const {comparator, alice, bob} = await deployComparatorLibrary({});

      expect(await comparator.addressNotEqual(alice.address, bob.address)).to.equal(true);
    });

    it("[FAILED] address not equal", async function () {
      const {comparator, alice} = await deployComparatorLibrary({});

      expect(await comparator.addressNotEqual(alice.address, alice.address)).to.equal(false);
    });

    it("[SUCCESS] address zero", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.addressZero(constants.ZeroAddress)).to.equal(true);
    });

    it("[FAILED] address zero", async function () {
      const {comparator, alice} = await deployComparatorLibrary({});

      expect(await comparator.addressZero(alice.address)).to.equal(false);
    });
  });
};
