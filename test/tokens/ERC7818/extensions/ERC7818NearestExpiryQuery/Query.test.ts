import {expect} from "chai";
import {network} from "hardhat";
import {deployERC7818NearestExpiryQuery} from "./utils.test";
import {common, ERC20} from "../../../../constant.test";

export const run = async () => {
  describe("Query", async function () {
    it("[HAPPY] query nearest expire balance", async function () {
      const {erc7818ExpNearestExpiryQuery, alice} = await deployERC7818NearestExpiryQuery();
      const aliceAddress = await alice.getAddress();
      const amount = 1;
      await expect(erc7818ExpNearestExpiryQuery.mint(aliceAddress, amount))
        .to.be.emit(erc7818ExpNearestExpiryQuery, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, aliceAddress, amount);
      const mintedBlockNumber = parseInt(await network.provider.send("eth_blockNumber"));
      const blockLength = await erc7818ExpNearestExpiryQuery.getFrameSizeInBlockLength();
      const [value, blockNumber] = await erc7818ExpNearestExpiryQuery.nearestExpireBalanceOf(aliceAddress);

      expect(value).to.equal(amount);
      expect(blockNumber).to.equal(mintedBlockNumber + blockLength);
    });

    it("[HAPPY] query no nearest expire balance", async function () {
      const {erc7818ExpNearestExpiryQuery, alice} = await deployERC7818NearestExpiryQuery();
      const aliceAddress = await alice.getAddress();
      const [value, blockNumber] = await erc7818ExpNearestExpiryQuery.nearestExpireBalanceOf(aliceAddress);
      expect(blockNumber).to.equal(0);
      expect(value).to.equal(0);
    });
  });
};
