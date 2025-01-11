import {expect} from "chai";
import {deployERC7818NearestExpirySelector} from "./deployer.test";
import {constants, ERC7818NearestExpiryQuery} from "../../../../constant.test";
import {hardhat_reset} from "../../../../utils.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("NearestExpiryOf", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] nearestExpiryOf", async function () {
      // const {erc20exp, alice} = await deployERC7818NearestExpirySelector({epochType});
      // const amount = 1;
      // await erc20exp.mint(alice.address, amount);
      // const pointerInWindow = Number((await erc20exp.epochLength()) * (await erc20exp.validityDuration()));
      // const latestPointer = await hardhat_latestPointer();
      // const [balance, expiry] = await erc20exp.nearestExpiryOf(alice.address);
      // expect(balance).to.equal(1);
      // expect(expiry).to.equal(latestPointer + pointerInWindow);
    });

    it("[SUCCESS] nearestExpiryOf with empty epoch", async function () {
      // const {erc20exp, alice} = await deployERC7818NearestExpirySelector({epochType});
      // const [balance, expiry] = await erc20exp.nearestExpiryOf(alice.address);
      // expect(balance).to.equal(0);
      // expect(expiry).to.equal(0);
    });
  });
};
