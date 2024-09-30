import { expect } from "chai";
import { deployERC20EXPNearestExpiryQuery } from "../../utils.test";
import { EVENT_TRANSFER, ZERO_ADDRESS } from "../../constant.test";
import { network } from "hardhat";

export const run = async () => {
    describe("Query", async function () {
        it("[HAPPY] query nearest expire balance", async function () {
            const { erc20ExpNearestExpiryQuery, alice } = await deployERC20EXPNearestExpiryQuery();
            const aliceAddress = await alice.getAddress();
            const amount = 1;
            await expect(erc20ExpNearestExpiryQuery.mint(aliceAddress, amount))
                .to.be.emit(erc20ExpNearestExpiryQuery, EVENT_TRANSFER)
                .withArgs(ZERO_ADDRESS, aliceAddress, amount);
            const mintedBlockNumber = parseInt(await network.provider.send("eth_blockNumber"));
            const blockLength = await erc20ExpNearestExpiryQuery.getFrameSizeInBlockLength();
            const [value, blockNumber] = await erc20ExpNearestExpiryQuery.nearestExpireBalanceOf(aliceAddress);

            expect(value).to.equal(amount);
            expect(blockNumber).to.equal(mintedBlockNumber + blockLength);
        });

        it("[HAPPY] query no nearest expire balance", async function () {
            const { erc20ExpNearestExpiryQuery, alice } = await deployERC20EXPNearestExpiryQuery();
            const aliceAddress = await alice.getAddress();
            const [value, blockNumber] = await erc20ExpNearestExpiryQuery.nearestExpireBalanceOf(aliceAddress);
            expect(blockNumber).to.equal(0);
            expect(value).to.equal(0);
        });
    });
};