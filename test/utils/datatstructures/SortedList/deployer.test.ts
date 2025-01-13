import {ethers} from "hardhat";
import {SortedCircularDoublyLinkedListLibrary} from "../../../constant.test";

export const deploySortedList = async function (contract: string) {
  // @TODO selector
  if (contract === SortedCircularDoublyLinkedListLibrary.name) {
    // contract = Xort128.name;
  } else {
    // default
    contract = SortedCircularDoublyLinkedListLibrary.name;
  }
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const SORTED_LIST = await ethers.getContractFactory(contract, deployer);
  const sortedlist = await SORTED_LIST.deploy();
  await sortedlist.waitForDeployment();
  return {
    sortedlist,
    deployer,
    alice,
    bob,
    charlie,
  };
};
