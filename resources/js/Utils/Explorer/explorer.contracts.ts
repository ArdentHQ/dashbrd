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
