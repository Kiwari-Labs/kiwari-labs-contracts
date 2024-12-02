import {expect} from "chai";
import {mineBlock} from "../../../utils.test";
import {deployERC20EXPBase} from "./utils.test";
import {common, ERC20, ERC20EXPBase} from "../../../constant.test";
import {calculateSlidingWindowState} from "../../../utils/SlidingWindow/utils.test";
import {network} from "hardhat";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per epoch", async function () {
      const blockPeriod = 400;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod});

      const self = calculateSlidingWindowState({blockPeriod});
      expect(await erc20exp.getBlocksPerEpoch()).to.equal(self._blockPerEpoch);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const slotSize = 4;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize});
      expect(await erc20exp.getBlocksPerSlot()).to.equal(self._blockPerSlot);
    });

    it("[HAPPY] query slot per epoch", async function () {
      const slotSize = 4;

      const {erc20exp} = await deployERC20EXPBase({slotSize});

      const self = calculateSlidingWindowState({slotSize});
      expect(await erc20exp.getSlotsPerEpoch()).to.equal(self._slotSize);
    });

    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await erc20exp.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[HAPPY] query frame", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize, frameSize});

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

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});

      await mineBlock(Number(self._blockPerSlot) * 5);

      const [fromEpoch, toEpoch, fromSlot, toSlot] = await erc20exp.safeFrame();

      expect(fromEpoch).to.equal(0);
      expect(toEpoch).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] query name", async function () {
      const {erc20exp} = await deployERC20EXPBase({});

      expect(await erc20exp.name()).to.equal(ERC20EXPBase.constructor.name);
    });

    it("[HAPPY] query symbol", async function () {
      const {erc20exp} = await deployERC20EXPBase({});

      expect(await erc20exp.symbol()).to.equal(ERC20EXPBase.constructor.symbol);
    });

    it("[HAPPY] query total supply", async function () {
      const {erc20exp} = await deployERC20EXPBase({});

      // Due to token can expiration there is no actual totalSupply.
      expect(await erc20exp.totalSupply()).to.equal(0);
    });

    it("[HAPPY] query decimals", async function () {
      const {erc20exp} = await deployERC20EXPBase({});

      expect(await erc20exp.decimals()).to.equal(18);
    });

    it("[HAPPY] query block balance", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});

      const amount = 1;
      await expect(erc20exp["mint(address,uint256)"](alice.address, amount))
        .to.be.emit(erc20exp, ERC20.events.Transfer)
        .withArgs(common.zeroAddress, alice.address, amount);
      const blockNumber = await network.provider.send("eth_blockNumber");
      expect(await erc20exp.getBlockBalance(blockNumber)).to.equal(1);
      expect(await erc20exp.getBlockBalance(blockNumber + 1n)).to.equal(0);
    });

    it("[HAPPY] query duration", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await erc20exp.duration()).to.equal(self._frameSizeInBlockLength);
    });

    it("[HAPPY] query epoch", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});

      expect(await erc20exp.epoch()).to.equal(0);

      await mineBlock(Number(self._blockPerEpoch));

      expect(await erc20exp.epoch()).to.equal(1);
    });
  });
};
