import { type QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useWalletPollingInterval } from "./useWalletPollingIntervals";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    user?: App.Data.UserData | null;
    wallet?: App.Data.Wallet.WalletData | null;
}

export const useActiveWallet = (wallet?: App.Data.Wallet.WalletData | null): Properties => {
    const { calculateInterval } = useWalletPollingInterval();

    const queryClient = useQueryClient();
    const queryKey: QueryKey = ["wallet-data"];

    const { data } = useQuery({
        enabled: isTruthy(wallet),
        queryKey,
        refetchInterval: () => calculateInterval(wallet, queryClient.getQueryState(queryKey)?.dataUpdateCount),
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        select: ({ data }) => data,
        queryFn: async () => await axios.get<Properties>(route("wallet")),
    });

    return {
        wallet: data?.wallet,
        user: data?.user,
    };
};
