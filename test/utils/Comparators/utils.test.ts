import {ethers} from "hardhat";
import {Comparator} from "../../constant.test";

export const deployComparatorLibrary = async function ({}) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();

  const ComparatorContract = await ethers.getContractFactory(Comparator.name, deployer);
  const comparator = await ComparatorContract.deploy();

  return {
    comparator,
    deployer,
    alice,
    bob,
    jame,
  };
};
