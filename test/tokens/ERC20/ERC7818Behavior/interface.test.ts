import {expect} from "chai";
import {hardhat_increasePointerTo, hardhat_latestPointer, hardhat_reset} from "../../../utils.test";
import {deployERC20Selector} from "../base/deployer.test";
import {constants, ERC20} from "../../../constant.test";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Interfaces", async function () {
    const amount = 1;

    afterEach(async function () {
      await hardhat_reset();
    });

    // NOTE: due to the token can expire, there is no actual accumulate value of `totalSupply`.
    it("[SUCCESS] IERC20Metadata", async function () {
      const {erc20exp} = await deployERC20Selector({epochType});
      expect(await erc20exp.decimals()).to.equal(18);
      expect(await erc20exp.name()).to.equal(ERC20.constructor.name);
      expect(await erc20exp.symbol()).to.equal(ERC20.constructor.symbol);
      expect(await erc20exp.totalSupply()).to.equal(0);
    });

    it("[SUCCESS] balance", async function () {
      const {erc20exp, alice} = await deployERC20Selector({epochType});
      const epoch = await erc20exp.currentEpoch();
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch + 1n, alice.address)).to.equal(0);
    });

    it("[SUCCESS] balanceAtEpoch", async function () {
      const {erc20exp, alice} = await deployERC20Selector({epochType});
      const epoch = await erc20exp.currentEpoch();
      expect(await erc20exp.balanceOfAtEpoch(epoch, alice.address)).to.equal(0);
      expect(await erc20exp.balanceOfAtEpoch(epoch + 1n, alice.address)).to.equal(0);
    });

    it("[SUCCESS] currentEpoch", async function () {
      const {erc20exp} = await deployERC20Selector({epochType});
      const epochLength = await erc20exp.epochLength();
      expect(await erc20exp.currentEpoch()).to.equal(0);
      await hardhat_increasePointerTo(epochType, epochLength);
      expect(await erc20exp.currentEpoch()).to.equal(1);
    });

    it("[SUCCESS] epochLength", async function () {
      const {erc20exp} = await deployERC20Selector({epochType});
      expect(await erc20exp.epochLength()).to.equal(
        epochType === constants.EPOCH_TYPE.BLOCKS_BASED ? constants.DEFAULT_BLOCKS_PER_EPOCH : constants.DEFAULT_SECONDS_PER_EPOCH,
      );
    });

    it("[SUCCESS] isEpochExpired", async function () {
      const {erc20exp} = await deployERC20Selector({epochType});
      const epochLength = await erc20exp.epochLength();
      const duration = await erc20exp.validityDuration();

      await hardhat_increasePointerTo(epochType, epochLength * duration);
      expect(await erc20exp.isEpochExpired(0)).to.equal(false);

      await hardhat_increasePointerTo(epochType, epochLength + 1n);
      expect(await erc20exp.isEpochExpired(0)).to.equal(true);
    });

    it("[SUCCESS] epochType", async function () {
      const {erc20exp} = await deployERC20Selector({epochType});
      expect(await erc20exp.epochType()).to.equal(epochType);
    });

    it("[SUCCESS] validityDuration", async function () {
      const windowSize = 2;
      const {erc20exp} = await deployERC20Selector({epochType});
      expect(await erc20exp.validityDuration()).to.equal(windowSize);
    });

    it("[SUCCESS] getWorldStateBalance", async function () {
      const {erc20exp, alice} = await deployERC20Selector({epochType});
      await erc20exp.mint(alice.address, amount);
      const latestPointer = await hardhat_latestPointer(epochType);
      expect(await erc20exp.getWorldStateBalance(0)).to.equal(0);
      expect(await erc20exp.getWorldStateBalance(latestPointer)).to.equal(1);
    });
  });
};
