import {ethers} from "hardhat";
import {LightWeightSlidingWindow} from "../../constant.test";

export const deployLightWeightSlidingWindow = async function ({
  startBlockNumber = 100, // start at a current block.number
  blockPeriod = 400, // 400ms per block
  frameSize = 2, // frame size 2 slot
}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const LightWeightSlidingWindowContract = await ethers.getContractFactory(LightWeightSlidingWindow.name, deployer);

  const lightWeightSlidingWindow = await LightWeightSlidingWindowContract.deploy(
    startBlockNumber,
    blockPeriod,
    frameSize,
  );

  await lightWeightSlidingWindow.deployed();

  return {
    lightWeightSlidingWindow,
    deployer,
    alice,
    bob,
    jame,
  };
};
