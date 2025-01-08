import {expect} from "chai";
import {hardhat_latestBlock, hardhat_mine, hardhat_reset} from "../../../utils.test";
import {deployERC20EXPBase} from "./deployer.test";
import {ERC20EXPBase} from "../../../constant.test";
import {calculateSlidingWindowState} from "../../../utils/algorithms/BLSW/deployer.test";

export const run = async () => {
  describe("Interfaces", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    /* @notice due to the token can expire, there is no actual accumulate value of `totalSupply`.*/
    it("[SUCCESS] IERC20Metadata", async function () {
      const {erc20exp} = await deployERC20EXPBase({});
      expect(await erc20exp.decimals()).to.equal(18);
      expect(await erc20exp.name()).to.equal(ERC20EXPBase.constructor.name);
      expect(await erc20exp.symbol()).to.equal(ERC20EXPBase.constructor.symbol);
      expect(await erc20exp.totalSupply()).to.equal(0);
    });

    it("[SUCCESS] balanceAtEpoch", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      expect(await erc20exp.balanceOfAtEpoch(0, alice.address)).to.equal(0);
    });

    it("[SUCCESS] currentEpoch", async function () {
      const {erc20exp} = await deployERC20EXPBase({});
      const self = calculateSlidingWindowState({});
      expect(await erc20exp.currentEpoch()).to.equal(0);
      await hardhat_mine(self._blocksPerEpoch);
      expect(await erc20exp.currentEpoch()).to.equal(1);
    });

    it("[SUCCESS] epochLength", async function () {
      const {erc20exp} = await deployERC20EXPBase({});
      const self = calculateSlidingWindowState({});
      expect(await erc20exp.epochLength()).to.equal(self._blocksPerEpoch);
    });

    it("[SUCCESS] isEpochExpired", async function () {
      const {erc20exp} = await deployERC20EXPBase({});
      const epochLength = await erc20exp.epochLength();
      const duration = await erc20exp.validityDuration();
      expect(await erc20exp.isEpochExpired(0)).to.equal(false);
      await hardhat_mine(epochLength * duration);

      /* buffer 1 epoch */
      await hardhat_mine(epochLength);
      expect(await erc20exp.isEpochExpired(0)).to.equal(false);

      await hardhat_mine(epochLength);
      expect(await erc20exp.isEpochExpired(0)).to.equal(true);
    });

    it("[SUCCESS] epochType", async function () {
      const {erc20exp} = await deployERC20EXPBase({});
      expect(await erc20exp.epochType()).to.equal(0);
      /* if implementation use time based */
      // expect(await erc20exp.epochType()).to.equal(1);
    });

    it("[SUCCESS] validityDuration", async function () {
      const windowSize = 4;
      const {erc20exp} = await deployERC20EXPBase({});
      expect(await erc20exp.validityDuration()).to.equal(windowSize);
    });

    /* @notice additional function from ERC7818 */
    it("[SUCCESS] getWorldStateBalance", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      const amount = 1;
      await erc20exp.mint(alice.address, amount);
      const latestBlock = await hardhat_latestBlock();
      expect(await erc20exp.getWorldStateBalance(0)).to.equal(0);
      expect(await erc20exp.getWorldStateBalance(latestBlock)).to.equal(1);
    });

    /* @notice additional function from ERC7818 */
    it("[SUCCESS] getNearestExpiryOf", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      const amount = 1;
      await erc20exp.mint(alice.address, amount);
      const blocksInWindow = Number((await erc20exp.epochLength()) * (await erc20exp.validityDuration()));
      const latestBlock = await hardhat_latestBlock();
      const [balance, expiry] = await erc20exp.getNearestExpiryOf(alice.address);
      expect(balance).to.equal(1);
      expect(expiry).to.equal(latestBlock + blocksInWindow);
    });
  });
};
