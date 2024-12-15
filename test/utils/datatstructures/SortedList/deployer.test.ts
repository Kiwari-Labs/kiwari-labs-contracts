import {ethers} from "hardhat";
import {BLSWLibrary, SortedCircularDoublyLinkedListLibrary} from "../../../constant.test";
import {NumberLike} from "@nomicfoundation/hardhat-network-helpers/dist/src/types";

export const deploySortedList = async function (contract: string) {
  // @TODO selector
  if (contract === SortedCircularDoublyLinkedListLibrary.name) {
    // contract = Xort128.name;
  } else {
    // default
    contract = SortedCircularDoublyLinkedListLibrary.name;
  }
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const SortedList = await ethers.getContractFactory(contract, deployer);
  const sortedlist = await SortedList.deploy();
  await sortedlist.deployed();
  return {
    sortedlist,
    deployer,
    alice,
    bob,
    charlie,
  };
};
