import {ethers} from "hardhat";
import {SortedCircularDoublyLinkedListLibrary} from "../../constant.test";
import {padIndexToData} from "../../utils.test";

export const deployDoublyListLibrary = async function ({autoList = false, len = 10}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const DoublyList = await ethers.getContractFactory(SortedCircularDoublyLinkedListLibrary.name, deployer);
  const doublyList = await DoublyList.deploy();
  await doublyList.deployed();

  // To automatically generate the list.
  // [1, 2, 3, ... , 8, 9, 10]
  if (autoList) {
    for (let i = 0; i < len; i++) {
      const index = i + 1;
      const data = padIndexToData(index);
      await doublyList.insert(index, data);
    }
  }

  return {
    doublyList,
    deployer,
    alice,
    bob,
    jame,
  };
};
