import { ExplorerChains } from "./explorer.contracts";

export interface NetworkManifest {
    chainId: number;
    links: {
        fees: string;
        transactions: string;
    };
}

interface ChainManifest {
    Mainnet: NetworkManifest;
    Testnet: NetworkManifest;
}

export const Polygon: ChainManifest = {
    Mainnet: {
        chainId: ExplorerChains.PolygonMainnet,
        links: {
            // https://docs.polygonscan.com/api-endpoints/accounts#get-a-list-of-erc-20-token-transfer-events-by-address
            transactions:
                "https://api.polygonscan.com/api?module=account&action=tokentx&startblock=0&endblock=99999999&offset=11&sort=desc",
            fees: "https://api.polygonscan.com/api?module=gastracker&action=gasoracle",
        },
    },
    Testnet: {
        chainId: ExplorerChains.PolygonTestnet,
        links: {
            transactions:
                "https://api-testnet.polygonscan.com/api?module=account&action=tokentx&startblock=0&endblock=99999999&offset=11&sort=desc",
            fees: "https://api.polygonscan.com/api?module=gastracker&action=gasoracle",
        },
    },
};

export const Ethereum: ChainManifest = {
    Mainnet: {
        chainId: ExplorerChains.EthereumMainnet,
        links: {
            // https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-erc20-token-transfer-events-by-address
            transactions:
                "https://api.etherscan.io/api?module=account&action=tokentx&startblock=0&endblock=99999999&offset=11&sort=desc",
            fees: "https://api.etherscan.io/api?module=gastracker&action=gasoracle",
        },
    },
    Testnet: {
        chainId: ExplorerChains.EthereumTestnet,
        links: {
            transactions:
                "https://api-goerli.etherscan.io/api?module=account&action=tokentx&startblock=0&endblock=99999999&offset=11&sort=desc",
            fees: "https://api.etherscan.io/api?module=gastracker&action=gasoracle",
        },
    },
};

export const networks = [Polygon.Mainnet, Polygon.Testnet, Ethereum.Mainnet, Ethereum.Testnet];
