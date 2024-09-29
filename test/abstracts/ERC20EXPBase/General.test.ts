import {expect} from "chai";
import {calculateSlidingWindowState, deployERC20EXPBase, mineBlock} from "../../utils.test";
import {ERC20_EXP_NAME, ERC20_EXP_SYMBOL, EVENT_TRANSFER, ZERO_ADDRESS} from "../../constant.test";
import {network} from "hardhat";

export const run = async () => {
  describe("General", async function () {
    it("[HAPPY] query block per era", async function () {
      const blockPeriod = 400;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod});

      const self = calculateSlidingWindowState({blockPeriod});
      expect(await erc20exp.getBlockPerEra()).to.equal(self._blockPerEra);
    });

    it("[HAPPY] query block per slot", async function () {
      const blockPeriod = 400;
      const slotSize = 4;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize});
      expect(await erc20exp.getBlockPerSlot()).to.equal(self._blockPerSlot);
    });

    it("[HAPPY] query slot per era", async function () {
      const slotSize = 4;

      const {erc20exp} = await deployERC20EXPBase({slotSize});

      const self = calculateSlidingWindowState({slotSize});
      expect(await erc20exp.getSlotPerEra()).to.equal(self._slotSize);
    });

    it("[HAPPY] query frame size in block length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await erc20exp.getFrameSizeInBlockLength()).to.equal(self._frameSizeInBlockLength);
    });

    it("[HAPPY] query frame size in era length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await erc20exp.getFrameSizeInEraLength()).to.equal(self._frameSizeInEraAndSlotLength[0]);
    });

    it("[HAPPY] query frame size in slot length", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});
      expect(await erc20exp.getFrameSizeInSlotLength()).to.equal(self._frameSizeInEraAndSlotLength[1]);
    });

    it("[HAPPY] query frame", async function () {
      const blockPeriod = 400;
      const slotSize = 4;
      const frameSize = 2;

      const {erc20exp} = await deployERC20EXPBase({blockPeriod, slotSize, frameSize});

      const self = calculateSlidingWindowState({blockPeriod, slotSize, frameSize});

      await mineBlock(Number(self._blockPerSlot) * 5);

      const [fromEra, toEra, fromSlot, toSlot] = await erc20exp.frame();

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

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

      const [fromEra, toEra, fromSlot, toSlot] = await erc20exp.safeFrame();

      expect(fromEra).to.equal(0);
      expect(toEra).to.equal(1);

      expect(fromSlot).to.equal(2);
      expect(toSlot).to.equal(1);
    });

    it("[HAPPY] query name", async function () {
      const {erc20exp} = await deployERC20EXPBase({});

      expect(await erc20exp.name()).to.equal(ERC20_EXP_NAME);
    });

    it("[HAPPY] query symbol", async function () {
      const {erc20exp} = await deployERC20EXPBase({});

      expect(await erc20exp.symbol()).to.equal(ERC20_EXP_SYMBOL);
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

    it("[HAPPY] query block balance ", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      const aliceAddress = await alice.getAddress();
      const amount = 1;
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);
      const blockNumber = await network.provider.send("eth_blockNumber");
      expect(await erc20exp.getBlockBalance(blockNumber)).to.equal(1);
      expect(await erc20exp.getBlockBalance(blockNumber + 1n)).to.equal(0);
    });

    it("[HAPPY] query nearest expire balance", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      const aliceAddress = await alice.getAddress();
      const amount = 1;
      await expect(erc20exp.mint(aliceAddress, amount))
        .to.be.emit(erc20exp, EVENT_TRANSFER)
        .withArgs(ZERO_ADDRESS, aliceAddress, amount);
      const mintedBlockNumber = parseInt(await network.provider.send("eth_blockNumber"));
      const blockLength = await erc20exp.getFrameSizeInBlockLength();
      const [value, blockNumber] = await erc20exp.nearestExpireBalanceOf(aliceAddress);
  
      expect(value).to.equal(amount);
      expect(blockNumber).to.equal(mintedBlockNumber + blockLength);
    });

    it("[HAPPY] query no nearest expire balance", async function () {
      const {erc20exp, alice} = await deployERC20EXPBase({});
      const aliceAddress = await alice.getAddress();
      const amount = 0;
      const [value, blockNumber] = await erc20exp.nearestExpireBalanceOf(aliceAddress);
      expect(blockNumber).to.equal(amount);
    });
  });
};
