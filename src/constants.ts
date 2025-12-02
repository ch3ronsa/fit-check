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
