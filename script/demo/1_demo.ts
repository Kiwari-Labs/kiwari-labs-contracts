import {mine} from "@nomicfoundation/hardhat-network-helpers";
import {parseEther} from "ethers/lib/utils";
import {network, ethers} from "hardhat";

// @TODO before demostrate.
// import alice private key to wallet.
// import bob private key to wallet.
// start local network with 'npx hardhat node'.
// add hardhat network to wallet.

// @TODO script for testing in sequence.
// deploy new token with setting expiration period is 1 year.
// sleep for 3 min. enough time to import token from address.
// minting retail to alice with 1 token 10 iterate.
// sleep for 2 min. refresh metamask and see balance change.
// alice transfer to bob 10 token.
// sleep for 2 min. refresh metamask and see balance change.
// mine blocks skipping block 1 years.

async function main() {
  // const [alice, bob, charlie ] = await ethers.getSigners();
  // const ERC20EXP = await ethers.getContractFactory(
  //         "MockToken",
  //         alice,
  //       );
  // const erc20exp = await ERC20EXP.deploy(
  //         "PointToken",
  //         "POINT",
  //         4000,
  //         4,
  //       );
  // await erc20exp.deployed();
  // console.log("ERC20 point address:", erc20exp.address);
  // const aliceAddress = await alice.getAddress();
  // const bobAddress = await bob.getAddress();
  // const charliesAddress = await charlie.getAddress();
  // console.log("1: minting 100 token to alice")
  // await erc20exp.connect(alice).mintRetail(aliceAddress, parseEther("100"));
  // const aliceBalance = await erc20exp["balanceOf(address)"](aliceAddress);
  // console.log("alice:",aliceAddress,"balance:", aliceBalance.toString());
  // console.log("2: grant wholesale address to charlie");
  // await erc20exp.connect(charlie).grantWholeSale(charliesAddress);
  // To skip block
  await network.provider.send("hardhat_mine", [10000000]);

  //   console.log("currentBlock:", await ethers.provider.getBlockNumber());
  //   console.log("alice transfer to bob");
  //   await erc20exp.connect(alice).transfer(bob.getAddress(),100);
  //   const bobBalance = await erc20exp["balanceOf(address)"](bobAddress);
  //   console.log("bobBalance:", bobBalance.toString());
  //   const aliceBalanceAfter = await erc20exp["balanceOf(address)"](aliceAddress);
  //   console.log("aliceBalanceAfter:", aliceBalanceAfter.toString());
  //   const era = await erc20exp.blockPerEra();
  //   await network.provider.send("hardhat_mine", [10000000]);
  //   console.log("skip to expire block");
  //   console.log("currentBlock:", await ethers.provider.getBlockNumber());

  //   const aliceBalanceZero = await erc20exp["balanceOf(address)"](aliceAddress);
  //   const bobBalanceZero = await erc20exp["balanceOf(address)"](bobAddress);

  //   console.log("aliceBalanceAfter:", aliceBalanceZero.toString());
  //   console.log("bobBalanceAfter:", bobBalanceZero.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
