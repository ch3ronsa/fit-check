const hre = require("hardhat");

async function main() {
    console.log("Deploying FitCheckNFTV2 to Base...");

    const fitCheckNFTV2 = await hre.ethers.deployContract("FitCheckNFTV2");
    await fitCheckNFTV2.waitForDeployment();

    const address = fitCheckNFTV2.target;
    console.log(`FitCheckNFTV2 deployed to ${address}`);

    // Log configuration
    const mintFee = await fitCheckNFTV2.mintFee();
    const creatorShare = await fitCheckNFTV2.creatorShareBps();
    console.log(`Mint fee: ${hre.ethers.formatEther(mintFee)} ETH`);
    console.log(`Creator share: ${creatorShare / 100n}%`);
    console.log(`Default royalty: 5% (ERC-2981)`);

    // Verify on BaseScan
    console.log("\nVerifying contract on BaseScan...");
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: [],
        });
        console.log("Contract verified successfully!");
    } catch (err) {
        console.log("Verification failed (may already be verified):", err.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
