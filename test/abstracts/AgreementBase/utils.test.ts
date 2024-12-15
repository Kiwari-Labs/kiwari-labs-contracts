import {ethers} from "hardhat";
import {AgreementBase} from "../../constant.test";

export const deployAgreementBase = async function (name: string) {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  const AgreementBaseContract = await ethers.getContractFactory(AgreementBase.name, deployer);
  const agreementBase = await AgreementBaseContract.deploy(name);
  return {agreementBase, alice, bob, charlie};
};
