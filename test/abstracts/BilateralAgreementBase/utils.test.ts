import {ethers} from "hardhat";
import {AgreementBaseForBilateral, BilateralAgreementBase} from "../../constant.test";
import {PromiseOrValue} from "../../../typechain-types/common";

export const deployBilateralAgreementBase = async function (
  party: [PromiseOrValue<string>, PromiseOrValue<string>],
  implementation: string,
) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();
  const BilateralAgreement = await ethers.getContractFactory(BilateralAgreementBase.name, deployer);
  const bilateralAgreementBase = await BilateralAgreement.deploy(party, implementation);
  return {bilateralAgreementBase, alice, bob, jame};
};

export const deployAgreementBaseForBilateral = async function (name: string) {
  const [deployer, alice, bob, jame] = await ethers.getSigners();
  const AGREEMENT = await ethers.getContractFactory(AgreementBaseForBilateral.name, deployer);
  const agreementBase = await AGREEMENT.deploy(name);
  return {agreementBase, alice, bob, jame};
};
