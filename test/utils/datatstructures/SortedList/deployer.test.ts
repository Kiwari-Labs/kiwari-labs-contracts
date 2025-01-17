// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

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
