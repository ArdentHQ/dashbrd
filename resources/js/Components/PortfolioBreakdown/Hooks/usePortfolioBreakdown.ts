import { type QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GRAPH_BACKGROUND_COLORS } from "@/Components/PortfolioBreakdown/PortfolioBreakdown.contracts";
import { useWalletPollingInterval } from "@/Hooks/useWalletPollingIntervals";
import { isTruthy } from "@/Utils/is-truthy";

export const usePortfolioBreakdown = (
    wallet?: App.Data.Wallet.WalletData | null,
): {
    assets: App.Data.TokenPortfolioData[];
    isLoading: boolean;
} => {
    const { calculateInterval } = useWalletPollingInterval(wallet);

    const queryClient = useQueryClient();
    const queryKey: QueryKey = ["breakdown"];

    const { data, isLoading } = useQuery({
        enabled: isTruthy(wallet),
        queryKey,
        refetchInterval: () => calculateInterval(queryClient.getQueryState(queryKey)?.dataUpdateCount),
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        select: ({ data }) => data,
        queryFn: async () =>
            await axios.get<App.Data.TokenPortfolioData[]>(
                route("tokens.breakdown", {
                    top_count: GRAPH_BACKGROUND_COLORS.length - 1,
                }),
            ),
    });

    return {
        assets: data ?? [],
        isLoading,
    };
};
