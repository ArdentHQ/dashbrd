export interface ExplorerTransactionItem {
    hash: string;
    timeStamp: string;
    isError: string;
    confirmations: string;
    isSent: boolean;
    to: string;
    from: string;
    value: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    nonce: string;
}

export enum ExplorerChains {
    PolygonMainnet = 137,
    EthereumMainnet = 1,
    PolygonTestnet = 80001,
    EthereumTestnet = 5,
}

const TESTNET_ENABLED = process.env.MIX_TESTNET_ENABLED === "true";

export const getAllChains = (): number[] => {
    let chains = [ExplorerChains.EthereumMainnet, ExplorerChains.PolygonMainnet];

    if (TESTNET_ENABLED) {
        chains = [...chains, ExplorerChains.EthereumTestnet, ExplorerChains.PolygonTestnet];
    }

    return chains;
};
