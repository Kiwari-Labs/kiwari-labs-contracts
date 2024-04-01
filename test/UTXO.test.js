const { expect, assert  } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

describe("Unspent Transaction Output contract", function() {

  let token;
  let accounts;
  let timstamp = Date.now();

  before(async () => {
    const contract = await ethers.getContractFactory("UTXOToken");
    token = await contract.deploy();
    accounts = await ethers.getSigners();
    await token.deployed();
  });

  it("Mint", async function() {
    // await time.increaseTo(timstamp);
    for (i = 0; i < 10; i++) {
      await token.mint(accounts[0].address,1000);
    }
    // await token.mint(accounts[0].address,10000);
    // await token.mint(accounts[0].address,1000);
    const totalSupply = await token.totalSupply();
    expect(await token.balanceOf(accounts[0].address)).to.equal(totalSupply.toNumber());
  });

  it("Retrieve UTXO data", async function() {
    // const utxo  = await token.utxo(0);
    // const abiCoder = new ethers.utils.AbiCoder();
    // const data = abiCoder.decode(["uint256"],utxo.data)
    expect(await token.balanceOf(accounts[0].address)).to.equal(10000);
    // expect(utxo.owner).to.equal(accounts[0].address);
    // // expect(data.toString()).to.equal(timstamp);
    // expect(utxo.spent).to.equal(false);
  });

  it("Spent UTXO", async function(){
    await token.transfer(accounts[1].address, 10000);
    expect(await token.balanceOf(accounts[0].address)).to.equal(0);
    expect(await token.balanceOf(accounts[1].address)).to.equal(10000);
  });

  it("Spend expire utxo", async function() {
    await token.mint(accounts[0].address,10000);
    const trie  = await token._hash(accounts[0].address,0);
    const getTrie = await token.getTx(trie)
    const abiCoder = new ethers.utils.AbiCoder();
    const data = abiCoder.decode(["uint256"],getTrie[0].extraData)
    await time.increaseTo(data);
    await expect(
      token.transfer(accounts[1].address, 10000))
      .to.be.revertedWith( "UTXO has been expired");
  });
  
  // @TODO
  it("approve", async function() {});

  // @TODO
  it("transferFrom", async function (){});

  // @TODO
  it("allowance", async function (){});
  
});