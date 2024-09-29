import {expect} from "chai";
import {deployComparatorLibrary} from "../../../utils.test";
import {ZERO_ADDRESS} from "../../../constant.test";

export const run = async () => {
  describe("Address Comparator", async function () {
    it("[HAPPY] address equal", async function () {
      const {comparator, alice} = await deployComparatorLibrary({});
      const aliceAddress = await alice.getAddress();
      expect(await comparator.addressEqual(aliceAddress, aliceAddress)).to.equal(true);
    });

    it("[UNHAPPY] address equal", async function () {
      const {comparator, alice, bob} = await deployComparatorLibrary({});
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      expect(await comparator.addressEqual(aliceAddress, bobAddress)).to.equal(false);
    });

    it("[HAPPY] address not equal", async function () {
      const {comparator, alice, bob} = await deployComparatorLibrary({});
      const aliceAddress = await alice.getAddress();
      const bobAddress = await bob.getAddress();
      expect(await comparator.addressNotEqual(aliceAddress, bobAddress)).to.equal(true);
    });

    it("[UNHAPPY] address not equal", async function () {
      const {comparator, alice} = await deployComparatorLibrary({});
      const aliceAddress = await alice.getAddress();
      expect(await comparator.addressNotEqual(aliceAddress, aliceAddress)).to.equal(false);
    });

    it("[HAPPY] address zero", async function () {
      const {comparator} = await deployComparatorLibrary({});
      expect(await comparator.addressZero(ZERO_ADDRESS)).to.equal(true);
    });

    it("[UNHAPPY] address zero", async function () {
      const {comparator, alice} = await deployComparatorLibrary({});
      const aliceAddress = await alice.getAddress();
      expect(await comparator.addressZero(aliceAddress)).to.equal(false);
    });
  });
};
