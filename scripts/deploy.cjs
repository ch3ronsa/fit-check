const hre = require("hardhat");

async function main() {
    console.log("Deploying FitCheckNFT to Base Mainnet...");

    const fitCheckNFT = await hre.ethers.deployContract("FitCheckNFT");

    await fitCheckNFT.waitForDeployment();

    console.log(
        `FitCheckNFT deployed to ${fitCheckNFT.target}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
