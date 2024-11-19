import {Contract, Signer} from "ethers";
import {mine, time} from "@nomicfoundation/hardhat-network-helpers";

export const latestBlock = async function () {
  return await time.latestBlock();
};

export const mineBlock = async function (blocks: number = 1, options: {interval?: number} = {}) {
  await mine(blocks, options);
};

export const skipToBlock = async function (target: number) {
  await mine(target - (await time.latestBlock()));
};

export const padIndexToData = function (index: Number) {
  // The padding is applied from the start of this string (output: 0x0001).
  return `0x${index.toString().padStart(4, "0")}`;
};

export const getAddress = async function (account: Signer | Contract) {
  if (account instanceof Contract) {
    return account.address.toLowerCase();
  }
  return (await account.getAddress()).toLowerCase();
};
