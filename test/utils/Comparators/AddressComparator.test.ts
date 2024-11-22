import {expect} from "chai";
import {deployComparatorLibrary} from "./utils.test";
import {common} from "../../constant.test";

export const run = async () => {
  describe("Address Comparator", async function () {
    it("[HAPPY] address equal", async function () {
      const {comparator, alice} = await deployComparatorLibrary({});

      expect(await comparator.addressEqual(alice.address, alice.address)).to.equal(true);
    });

    it("[UNHAPPY] address equal", async function () {
      const {comparator, alice, bob} = await deployComparatorLibrary({});

      expect(await comparator.addressEqual(alice.address, bob.address)).to.equal(false);
    });

    it("[HAPPY] address not equal", async function () {
      const {comparator, alice, bob} = await deployComparatorLibrary({});

      expect(await comparator.addressNotEqual(alice.address, bob.address)).to.equal(true);
    });

    it("[UNHAPPY] address not equal", async function () {
      const {comparator, alice} = await deployComparatorLibrary({});

      expect(await comparator.addressNotEqual(alice.address, alice.address)).to.equal(false);
    });

    it("[HAPPY] address zero", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.addressZero(common.zeroAddress)).to.equal(true);
    });

    it("[UNHAPPY] address zero", async function () {
      const {comparator, alice} = await deployComparatorLibrary({});

      expect(await comparator.addressZero(alice.address)).to.equal(false);
    });
  });
};
