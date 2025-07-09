const { ethers } = require("hardhat");

const VOTER_ADDRESS = "0x6700a833034981b37CCAE382C798d5FA75122F1e"; // Dirección real del Voter en Kitten
const SAMPLE_POOL = "0xf3994B10d0E3153D99647a6Fe296102d2d6EadAF"; // Dirección real de un pool en Kitten
const USER_ADDRESS = "0x51b8b5790AFdD10FdfC3C80bf0703d9c6321bBb9"; // Dirección real de usuario que tiene stake
const REWARD_TOKEN = "0x618275F8EFE54c2afa87bfB9F210A52F0fF89364"; // Dirección del token KITTEN

const VoterABI = ["function gauges(address) view returns (address)"];

const IGaugeABI = [
  "function balanceOf(address) view returns (uint256)",
  "function earned(address) view returns (uint256)",
];

async function main() {
  const voter = await ethers.getContractAt(VoterABI, VOTER_ADDRESS);

  console.log(`Pool: ${SAMPLE_POOL}`);
  const gaugeAddr = await voter.gauges(SAMPLE_POOL);
  console.log(`Gauge: ${gaugeAddr}`);

  if (gaugeAddr === "0x0000000000000000000000000000000000000000") {
    console.log("Esta pool no tiene gauge.");
    return;
  }

  const gauge = await ethers.getContractAt(IGaugeABI, gaugeAddr);
  const balance = await gauge.balanceOf(USER_ADDRESS);
  const earned = await gauge.earned(USER_ADDRESS);

  console.log(`balanceOf: ${balance.toString()}`);
  console.log(`earned: ${earned.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
