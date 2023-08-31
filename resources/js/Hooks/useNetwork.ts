import { ExplorerChains } from "@/Utils/Explorer";

export const useNetwork = (): {
    isPolygon: (chainId: number) => boolean;
    isEthereum: (chainId: number) => boolean;
    isTestnet: (chainId: number) => boolean;
} => {
    const polygonNetworks = [ExplorerChains.PolygonMainnet, ExplorerChains.PolygonTestnet];
    const ethNetworks = [ExplorerChains.EthereumMainnet, ExplorerChains.EthereumTestnet];
    const testnets = [ExplorerChains.EthereumTestnet, ExplorerChains.PolygonTestnet];

    return {
        isPolygon: (chainId: number) => polygonNetworks.includes(chainId),
        isEthereum: (chainId: number) => ethNetworks.includes(chainId),
        isTestnet: (chainId: number) => testnets.includes(chainId),
    };
};
