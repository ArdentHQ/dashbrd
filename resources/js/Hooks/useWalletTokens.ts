import { type QueryKey, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useWalletPollingInterval } from "./useWalletPollingIntervals";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { isTruthy } from "@/Utils/is-truthy";

export type WalletTokensSortBy = "symbol" | "fiat_balance" | "token_price" | "market_cap" | "volume";
type SortDirection = "asc" | "desc";

interface SortOptions {
    sort: WalletTokensSortBy;
    direction: SortDirection;
}

interface WalletTokenReturnProperties {
    isLoading: boolean;
    loadMore: () => void;
    tokens: App.Data.TokenListItemData[];
    updateSortOptions: (sortBy: WalletTokensSortBy, sortDirection: SortDirection) => void;
    sortOptions: SortOptions;
}

export const useWalletTokens = (wallet?: App.Data.Wallet.WalletData | null): WalletTokenReturnProperties => {
    const { calculateInterval } = useWalletPollingInterval();

    const [sortOptions, setSortOptions] = useState<SortOptions>({
        sort: "fiat_balance",
        direction: "desc",
    });

    const queryClient = useQueryClient();
    const queryKey: QueryKey = ["wallet-tokens", sortOptions];

    const { data, isLoading, fetchNextPage } = useInfiniteQuery({
        enabled: isTruthy(wallet),
        queryKey,
        refetchOnWindowFocus: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchInterval: () => calculateInterval(wallet, queryClient.getQueryState(queryKey)?.dataUpdateCount),
        queryFn: async ({ pageParam }) =>
            await axios.get<PaginationData<App.Data.TokenListItemData>>(
                route("tokens.list", { page: pageParam as number, ...sortOptions }),
            ),
        getNextPageParam: ({ data }) =>
            data.meta.current_page < data.meta.last_page ? data.meta.current_page + 1 : undefined,
        select: ({ pages, pageParams }) => ({
            // Flatten all results into one list
            pages: pages.map(({ data }) => data.data).flat(Number.POSITIVE_INFINITY) as App.Data.TokenListItemData[],
            pageParams,
        }),
    });

    return {
        loadMore: () => {
            void fetchNextPage();
        },
        isLoading,
        sortOptions,
        tokens: data?.pages ?? [],
        updateSortOptions: (sort, direction) => {
            setSortOptions({
                direction: direction === "desc" ? "asc" : "desc",
                sort,
            });
        },
    };
};
