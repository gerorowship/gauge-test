const { ethers } = require("hardhat");
const fs = require("fs");

const FACTORY_ADDRESS = "0x420DD381b31aEf6683db6B902084cB0FFECe40Da";
const VOTER_ADDRESS = "0x16613524e02ad97eDfeF371bC883F2F5d6C480A5";

const START_INDEX = 1;
const BATCH_SIZE = 100;
const DELAY_MS = 1000;

const processedFile = "./processedPools.json";
const errorsFile = "./errors.json";

const PoolFactoryABI = [
  "function allPools(uint256) view returns (address)",
  "function allPoolsLength() view returns (uint256)",
];

const ICLPoolABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
];

const VoterABI = ["function gauges(address) view returns (address)"];

function saveJSON(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

function loadJSON(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename));
  } catch {
    return {};
  }
}

async function main() {
  const factory = await ethers.getContractAt(PoolFactoryABI, FACTORY_ADDRESS);
  const voter = await ethers.getContractAt(VoterABI, VOTER_ADDRESS);
  const poolsLength = Number(await factory.allPoolsLength());

  console.log(`🌐 Total pools: ${poolsLength}`);
  console.log(`🚀 Empezando desde el pool #${START_INDEX}\n`);

  const processedPools = loadJSON(processedFile);
  const errorPools = loadJSON(errorsFile);

  for (let i = START_INDEX; i < poolsLength; i += BATCH_SIZE) {
    const end = Math.min(i + BATCH_SIZE, poolsLength);
    console.log(`\n🔄 Procesando batch ${i} - ${end - 1}`);

    for (let j = i; j < end; j++) {
      if (processedPools[j] || errorPools[j]) {
        console.log(`⏩ Pool ${j} ya procesado o con error, saltando.`);
        continue;
      }

      try {
        console.log(`🔍 Leyendo dirección del pool ${j}...`);
        const poolAddress = await factory.allPools(j);
        console.log(`📦 Dirección del pool: ${poolAddress}`);

        const pool = await ethers.getContractAt(ICLPoolABI, poolAddress);
        const token0 = await pool.token0();
        const token1 = await pool.token1();

        console.log(`🔍 Consultando gauge en el Voter...`);
        const gauge = await voter.gauges(poolAddress);
        const hasGauge = gauge !== ethers.constants.AddressZero;

        processedPools[j] = {
          poolAddress,
          gauge,
          token0,
          token1,
          hasGauge,
        };

        console.log(
          `✅ Pool ${j}: ${token0}/${token1} | Gauge: ${gauge} | Pool: ${poolAddress}`
        );
      } catch (err) {
        console.error(`⚠️  Error en pool ${j}: ${err.message}`);
        errorPools[j] = { message: err.message };
      }
    }

    saveJSON(processedFile, processedPools);
    saveJSON(errorsFile, errorPools);

    if (end < poolsLength) {
      console.log(`⏳ Esperando ${DELAY_MS}ms...`);
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log("\n✅ Proceso completado.");
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});
