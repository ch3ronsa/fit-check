// V1 Contract (currently deployed)
export const CONTRACT_ADDRESS = "0x944bf2d3A45F35b371ACE61FfE7732CA7F236e30";

export const CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "string", "name": "uri", "type": "string" }
        ],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// V2 Contract (deploy with: npx hardhat run scripts/deployV2.cjs --network base)
// After deploying, update CONTRACT_V2_ADDRESS with the new address
export const CONTRACT_V2_ADDRESS = "" as `0x${string}`;

export const CONTRACT_V2_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "string", "name": "uri", "type": "string" }
        ],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "string", "name": "uri", "type": "string" },
            { "internalType": "address", "name": "frameCreator", "type": "address" }
        ],
        "name": "mintWithCreator",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mintFee",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawCreatorEarnings",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "name": "creatorEarnings",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;
