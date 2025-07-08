const { ethers } = require("hardhat");

async function main() {
  const rawVoterAddress = "0x16613524e02ad97eDfeF371bC883F2F5d6C480A5";
  const rawPoolAddress = "0xA4e46b4f701c62e14DF11B48dCe76A7d793CD6d7";

  const VOTER_ADDRESS = ethers.getAddress(rawVoterAddress);
  const POOL_ADDRESS = ethers.getAddress(rawPoolAddress);

  const IVoter = [
    "function gauges(address pool) external view returns (address gauge)",
  ];

  const [signer] = await ethers.getSigners();
  const voter = await ethers.getContractAt(IVoter, VOTER_ADDRESS, signer);

  const gaugeAddress = await voter.gauges(POOL_ADDRESS);
  console.log("Gauge:", gaugeAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
