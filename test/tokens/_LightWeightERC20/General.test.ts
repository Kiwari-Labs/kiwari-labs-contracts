import {expect} from "chai";
import {calculateSlidingWindowState, deployLightWeightERC20EXPBase, mineBlock} from "../../utils.test";
import {ERC20_EXP_NAME, ERC20_EXP_SYMBOL} from "../../constant.test";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per era", async function () {
      const blockPeriod = 400;

      const {erc20exp} = await deployLightWeightERC20EXPBase({blockPeriod});

      const self = calculateSlidingWindowState({blockPeriod});
      expect(await erc20exp.getBlocksPerEpoch()).to.equal(self._blockPerEpoch);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const slotSize = 4;

      const {erc20exp} = await deployLightWeightERC20EXPBase({blockPeriod, slotSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize});
      expect(await erc20exp.getBlocksPerSlot()).to.equal(self._blockPerSlot);
    });

    it("[HAPPY] query slot per era", async function () {
      const slotSize = 4;

      const {erc20exp} = await deployLightWeightERC20EXPBase({slotSize});

      const self = calculateSlidingWindowState({slotSize});
      expect(await erc20exp.getSlotsPerEpoch()).to.equal(self._slotSize);
    });

    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployLightWeightERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await erc20exp.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[HAPPY] query frame size in era length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployLightWeightERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await erc20exp.getFrameSizeInEpochLength()).to.equal(self._frameSizeInEpochAndSlotLength[0]);
    });

    it("[HAPPY] query frame size in slot length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployLightWeightERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await erc20exp.getFrameSizeInSlotLength()).to.equal(self._frameSizeInEpochAndSlotLength[1]);
    });

    it("[HAPPY] query frame", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployLightWeightERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});

      await mineBlock(Number(self._blockPerSlot) * 5);

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await erc20exp.frame();

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(3);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] query safe frame", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployLightWeightERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});

      await mineBlock(Number(self._blockPerSlot) * 5);

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await erc20exp.safeFrame();

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] query name", async function () {
      const {erc20exp} = await deployLightWeightERC20EXPBase({});

      expect(await erc20exp.name()).to.equal(ERC20_EXP_NAME);
    });

    it("[HAPPY] query symbol", async function () {
      const {erc20exp} = await deployLightWeightERC20EXPBase({});

      expect(await erc20exp.symbol()).to.equal(ERC20_EXP_SYMBOL);
    });

    it("[HAPPY] query total supply", async function () {
      const {erc20exp} = await deployLightWeightERC20EXPBase({});

      // Due to token can expiration there is no actual totalSupply.
      expect(await erc20exp.totalSupply()).to.equal(0);
    });

    it("[HAPPY] query decimals", async function () {
      const {erc20exp} = await deployLightWeightERC20EXPBase({});

      expect(await erc20exp.decimals()).to.equal(18);
    });
  });
};
