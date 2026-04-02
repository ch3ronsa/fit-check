const V1_FALLBACK_ADDRESS = '0x944bf2d3A45F35b371ACE61FfE7732CA7F236e30';
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

// V1 Contract (currently deployed)
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || V1_FALLBACK_ADDRESS) as `0x${string}`;

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

// V2 Contract can be enabled by setting VITE_CONTRACT_V2_ADDRESS
export const CONTRACT_V2_ADDRESS = (import.meta.env.VITE_CONTRACT_V2_ADDRESS || '') as `0x${string}`;
export const DEFAULT_V2_MINT_FEE_WEI = BigInt(import.meta.env.VITE_CONTRACT_V2_MINT_FEE_WEI || '100000000000000');
export const IS_CONTRACT_V2_ENABLED = ADDRESS_PATTERN.test(CONTRACT_V2_ADDRESS);

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
        "name": "creatorShareBps",
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
