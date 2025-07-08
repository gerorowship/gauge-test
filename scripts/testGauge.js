const { ethers } = require("hardhat");

async function main() {
  // Ver esto despues
  const GAUGE_ADDRESS = "0x..."; // Cambiar por gauge real
  const TOKEN_ID = 1234; // Cambiar por un tokenId real

  const IGauge = [
    "function deposit(uint256 tokenId) external",
    "function withdraw(uint256 tokenId) external",
    "function getReward(uint256 tokenId) external",
    "function killed() view returns (bool)",
  ];

  const [signer] = await ethers.getSigners();
  const gauge = await ethers.getContractAt(IGauge, GAUGE_ADDRESS, signer);

  console.log("Gauge killed:", await gauge.killed());

  console.log("Depositing token...");
  await gauge.deposit(TOKEN_ID);
  console.log("Rewarding...");
  await gauge.getReward(TOKEN_ID);
  console.log("Withdrawing token...");
  await gauge.withdraw(TOKEN_ID);
}
main().catch(console.error);
