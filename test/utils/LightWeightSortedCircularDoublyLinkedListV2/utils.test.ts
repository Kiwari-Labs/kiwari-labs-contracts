import {ethers} from "hardhat";
import {PU128SCDLL} from "../../constant.test";

export const deployLightWeightDoublyListLibraryV2 = async function ({autoList = false, len = 10} = {}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();
  const LightWeightDoublyList = await ethers.getContractFactory(PU128SCDLL.name, deployer);
  const lightWeightDoublyListV2 = await LightWeightDoublyList.deploy();
  await lightWeightDoublyListV2.deployed();

  // To automatically generate the list.
  // [1, 2, 3, ... , 8, 9, 10]
  if (autoList) {
    for (let i = 0; i < len; i++) {
      const index = i + 1;
      await lightWeightDoublyListV2.insert(index);
    }
  }

  return {
    lightWeightDoublyListV2,
    deployer,
    alice,
    bob,
    jame,
  };
};
