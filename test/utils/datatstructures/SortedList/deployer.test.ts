import {ethers} from "hardhat";
import {SortedListLibrary} from "../../../constant.test";

export const deploySortedList = async function (contract: string) {
  // @TODO selector
  if (contract === SortedListLibrary.name) {
    // contract = Xort128.name;
  } else {
    // default
    contract = SortedListLibrary.name;
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
