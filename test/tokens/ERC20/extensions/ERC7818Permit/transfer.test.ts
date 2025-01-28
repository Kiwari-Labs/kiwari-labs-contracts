import {expect} from "chai";
import {deployERC7818PermitSelector} from "./deployer.test";
import {constants, ERC20, ERC7818Permit} from "../../../../constant.test";
import {ethers, hardhat_latest, hardhat_reset} from "../../../../utils.test";
import unix from "unix-timestamp";

export const run = async ({epochType = constants.EPOCH_TYPE.BLOCKS_BASED}) => {
  describe("Transfer", async function () {
    afterEach(async function () {
      await hardhat_reset();
    });

    it("[SUCCESS] transferFrom with permit", async function () {
      const {erc7818Permit, alice, bob} = await deployERC7818PermitSelector({epochType});

      const amount = 100;

      await erc7818Permit.mint(alice.address, amount);

      const deadline = unix.add(await hardhat_latest(), "+10m");

      const nonce = await erc7818Permit.nonces(alice.address);

      // Get the domain separator for EIP-712
      const domain = {
        name: await erc7818Permit.name(), // Replace with the name of your token
        version: "1", // Token version (typically 1)
        chainId: await ethers.provider.getNetwork().then((n) => n.chainId), // Fetch the chain ID
        verifyingContract: erc7818Permit.target, // Token contract address
      };

      // Define the types for the EIP-712 permit signature
      const types = {
        Permit: [
          {name: "owner", type: "address"},
          {name: "spender", type: "address"},
          {name: "value", type: "uint256"},
          {name: "nonce", type: "uint256"},
          {name: "deadline", type: "uint256"},
        ],
      };

      // Define the value for the EIP-712 message
      const values = {
        owner: alice.address,
        spender: bob.address,
        value: amount,
        nonce: nonce,
        deadline: deadline,
      };

      // Sign the data using EIP-712 structured data
      const signature = await alice.signTypedData(
        {
          name: domain.name,
          version: domain.version,
          chainId: domain.chainId,
          verifyingContract: domain.verifyingContract.toString(),
        },
        types,
        values,
      );

      // Extract r, s, and v
      const r = "0x" + signature.slice(2, 66); // First 32 bytes
      const s = "0x" + signature.slice(66, 130); // Next 32 bytes
      const v = parseInt(signature.slice(130, 132), 16); // Last byte as integer

      await erc7818Permit.connect(bob).transferFromWithPermit(alice.address, bob.address, 100, deadline, v, r, s);

      expect(await erc7818Permit.balanceOf(alice.address)).to.equal(0);
      expect(await erc7818Permit.balanceOf(bob.address)).to.equal(100);
    });

    it("[FAILED] transferFrom with permit", async function () {
      const {erc7818Permit, alice, bob} = await deployERC7818PermitSelector({epochType});

      const amount = 100;

      await erc7818Permit.mint(alice.address, amount);

      const deadline = unix.add(await hardhat_latest(), "-10m");

      const signature = await alice.signMessage("");

      // Extract r, s, and v
      const r = "0x" + signature.slice(2, 66); // First 32 bytes
      const s = "0x" + signature.slice(66, 130); // Next 32 bytes
      const v = parseInt(signature.slice(130, 132), 16); // Last byte as integer

      await expect(
        erc7818Permit.connect(bob).transferFromWithPermit(alice.address, bob.address, 100, deadline, v, r, s),
      ).to.be.revertedWithCustomError(erc7818Permit, ERC7818Permit.errors.ERC2612ExpiredSignature);
    });

    it("[FAILED] transferFrom with permit", async function () {
      const {erc7818Permit, alice, bob} = await deployERC7818PermitSelector({epochType});

      const amount = 100;

      await erc7818Permit.mint(alice.address, amount);

      const deadline = unix.add(await hardhat_latest(), "+10m");

      const signature = await alice.signMessage("");

      // Extract r, s, and v
      const r = "0x" + signature.slice(2, 66); // First 32 bytes
      const s = "0x" + signature.slice(66, 130); // Next 32 bytes
      const v = parseInt(signature.slice(130, 132), 16); // Last byte as integer

      await expect(
        erc7818Permit.connect(bob).transferFromWithPermit(alice.address, bob.address, 100, deadline, v, r, s),
      ).to.be.revertedWithCustomError(erc7818Permit, ERC7818Permit.errors.ERC2612InvalidSigner);
    });
  });
};
