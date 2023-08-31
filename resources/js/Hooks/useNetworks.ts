import axios from "axios";
import { useCallback, useState } from "react";
import { isTruthy } from "@/Utils/is-truthy";

export const useNetworks = (): {
    getByChainId: (chainId?: number) => Promise<void>;
    getExplorerUrlsKeyByChainId: (chainId: number) => string;
    network?: App.Data.NetworkData;
} => {
    const [network, setNetwork] = useState<App.Data.NetworkData>();

    const getByChainId = useCallback(async (chainId?: number) => {
        const { data } = await axios.get<App.Data.NetworkData>(route("network-by-chain", chainId));

        setNetwork(data);
    }, []);

    const explorerUrlsKeyMap: Record<number, string> = {
        1: "etherscan",
        5: "goerli",
        137: "polygonscan",
        80001: "mumbai",
    };

    const getExplorerUrlsKeyByChainId = (chainId: number): string => {
        if (!isTruthy(explorerUrlsKeyMap[chainId])) {
            throw new Error(`[getExplorerUrlsKeyByChainId] Chain [${chainId}]is not supported`);
        }

        return explorerUrlsKeyMap[chainId];
    };

    return {
        getByChainId,
        network,
        getExplorerUrlsKeyByChainId,
    };
};
