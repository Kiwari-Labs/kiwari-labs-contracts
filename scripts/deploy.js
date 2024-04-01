const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("UTXOToken");
  const token = await Token.deploy();

  await token.deployed();

  console.log(
    `UTXO token deployed to ${token.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
