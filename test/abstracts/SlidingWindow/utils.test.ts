import {ethers} from "hardhat";
import {SlidingWindow} from "../../constant.test";

export const deploySlidingWindow = async function ({
  startBlockNumber = 100, // start at a current block.number
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
  slotSize = 4, // 4 slot per epoch
}) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();

  const SlidingWindowContract = await ethers.getContractFactory(SlidingWindow.name, deployer);

  const slidingWindow = await SlidingWindowContract.deploy(startBlockNumber, blockPeriod, frameSize, slotSize);

  await slidingWindow.deployed();

  return {
    slidingWindow,
    deployer,
    alice,
    bob,
    charlie,
  };
};
