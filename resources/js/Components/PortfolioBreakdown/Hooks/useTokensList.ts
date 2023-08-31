import axios from "axios";
import { useEffect, useState } from "react";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { isTruthy } from "@/Utils/is-truthy";

export type TokensListSortBy = "symbol" | "fiat_balance" | "token_price" | "market_cap" | "volume";

type SortDirection = "asc" | "desc";

const defaultPageSize = 10;

export const useTokensList = (): {
    sortBy: TokensListSortBy;
    sortDirection: SortDirection;
    tokens: App.Data.TokenListItemData[];
    loading: boolean;
    loadingMore: boolean;
    loadTokens: () => Promise<void>;
    loadMoreTokens: () => void;
    updateSort: (sortBy: TokensListSortBy, sortDirection: SortDirection) => void;
    reloadAllTokens: () => Promise<void>;
} => {
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [tokens, setTokens] = useState<App.Data.TokenListItemData[]>([]);
    const [tokensLoaded, setTokensLoaded] = useState(false);
    const [tokensMeta, setTokensMeta] = useState<PaginationData<App.Data.TokenListItemData>["meta"]>();
    const [sortBy, setSortBy] = useState<TokensListSortBy>("fiat_balance");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const loadTokens = async (): Promise<void> => {
        setLoading(true);

        const { data } = await axios.get<PaginationData<App.Data.TokenListItemData>>(
            route("tokens.list", {
                sort: sortBy,
                direction: sortDirection,
            }),
        );

        setTokens(data.data);

        setTokensMeta(data.meta);

        setLoading(false);

        setTokensLoaded(true);
    };

    const loadMoreTokens = async (): Promise<void> => {
        if (tokensMeta?.next_page_url == null) {
            setLoadingMore(false);
            return;
        }

        const { data } = await axios.get<PaginationData<App.Data.TokenListItemData>>(
            tokensMeta.next_page_url + "&sort=" + sortBy + "&direction=" + sortDirection,
        );

        setTokens((tokens) => [...tokens, ...data.data]);

        setTokensMeta(data.meta);

        setLoadingMore(false);
    };

    const reloadAllTokens = async (): Promise<void> => {
        /* istanbul ignore next -- @preserve */
        if (loadingMore || loading || !tokensLoaded) {
            setLoading(false);
            return;
        }

        const pageSize = isTruthy(tokensMeta) ? tokensMeta.per_page * tokensMeta.current_page : defaultPageSize;

        const { data } = await axios.get<PaginationData<App.Data.TokenListItemData>>(
            route("tokens.list", {
                page_size: pageSize,
                sort: sortBy,
                direction: sortDirection,
            }),
            {
                requestId: "tokens-list",
            },
        );

        setTokens(data.data);

        setLoading(false);
    };

    const updateSort = (sortBy: TokensListSortBy, sortDirection: SortDirection): void => {
        setSortBy(sortBy);

        setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    };

    useEffect(() => {
        setLoading(true);

        void reloadAllTokens();
    }, [sortBy, sortDirection]);

    const startLoadingMoreTokens = (): void => {
        setLoadingMore(true);
    };

    useEffect(() => {
        if (loadingMore) {
            void loadMoreTokens();
        }
    }, [loadingMore]);

    return {
        tokens,
        loading,
        loadMoreTokens: startLoadingMoreTokens,
        reloadAllTokens,
        loadTokens,
        updateSort,
        sortBy,
        sortDirection,
        loadingMore,
    };
};
