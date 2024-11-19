import {ethers} from "hardhat";
import {LightWeightSortedCircularDoublyLinkedListLibrary} from "../../constant.test";

export const deployLightWeightDoublyListLibrary = async function ({autoList = false, len = 10} = {}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const LightWeightDoublyList = await ethers.getContractFactory(
    LightWeightSortedCircularDoublyLinkedListLibrary.name,
    deployer,
  );
  const lightWeightDoublyList = await LightWeightDoublyList.deploy();
  await lightWeightDoublyList.deployed();

  // To automatically generate the list.
  // [1, 2, 3, ... , 8, 9, 10]
  if (autoList) {
    for (let i = 0; i < len; i++) {
      const index = i + 1;
      await lightWeightDoublyList.insert(index);
    }
  }

  return {
    lightWeightDoublyList,
    deployer,
    alice,
    bob,
    jame,
  };
};
