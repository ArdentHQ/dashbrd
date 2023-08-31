import axios from "axios";
import { useCallback, useState } from "react";
import TokenListItemData = App.Data.TokenListItemData;
import { useLiveSearch } from "@/Hooks/useLiveSearch";
import { isTruthy } from "@/Utils/is-truthy";

interface UseAssetsState {
    search: (query: string) => void;
    isSearching: boolean;
    assets: TokenListItemData[];
    query: string;
}

interface UseAssetsProperties {
    initialAssets: TokenListItemData[];
    onSearchError: (error: unknown) => void;
}

export const useAssets = ({ initialAssets, onSearchError }: UseAssetsProperties): UseAssetsState => {
    const [assets, setAssets] = useState<TokenListItemData[]>(initialAssets);

    const searchTokens = async (query: string): Promise<void> => {
        const { data } = await axios.get<App.Data.TokenListItemData[]>(route("tokens.search", { query }), {
            requestId: "search-tokens",
        });
        setAssets(data);
    };

    const {
        query,
        setQuery,
        loading: isSearching,
    } = useLiveSearch({
        request: async (query: string) => {
            await searchTokens(query);
        },
        onError: onSearchError,
    });

    const search = useCallback(
        (searchQuery: string) => {
            setQuery(searchQuery);

            if (!isTruthy(searchQuery)) {
                setAssets(initialAssets);
            }
        },
        [setQuery],
    );

    return {
        search,
        isSearching: isTruthy(query) && isSearching,
        assets,
        query,
    };
};
