import { isNumber } from "@ardenthq/sdk-helpers";
import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { useInertiaHeader } from "@/Hooks/useInertiaHeader";
import { useLiveSearch } from "@/Hooks/useLiveSearch";
import { type CollectionDisplayType } from "@/Pages/Collections/Components/CollectionsFilter";
import { getAllChains } from "@/Utils/Explorer";
import { isTruthy } from "@/Utils/is-truthy";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

type ReportByCollectionAvailableIn = Record<string, string | null>;
type AlreadyReportedByCollection = Record<string, boolean>;

interface QueryParameters {
    page?: number;
    showHidden?: boolean;
    query?: string;
    sort?: string | null;
    selectedChainIds?: number[];
}

interface CollectionsResponse {
    collections: PaginationData<App.Data.Collections.CollectionData>;
    nfts: App.Data.Collections.CollectionNftData[];
    reportByCollectionAvailableIn: ReportByCollectionAvailableIn;
    alreadyReportedByCollection: AlreadyReportedByCollection;
    hiddenCollectionAddresses: string[];
    availableNetworks: App.Data.Network.NetworkWithCollectionsData[];
}

interface CollectionsState {
    loadMore: () => void;
    reload: ({
        showHidden,
        page,
        selectedChainIds,
    }?: {
        showHidden?: boolean;
        page?: number;
        selectedChainIds?: number[];
    }) => void;
    collections: App.Data.Collections.CollectionData[];
    nfts: App.Data.Collections.CollectionNftData[];
    isLoading: boolean;
    reportByCollectionAvailableIn: ReportByCollectionAvailableIn;
    alreadyReportedByCollection: AlreadyReportedByCollection;
    hiddenCollectionAddresses: string[];
    availableNetworks: App.Data.Network.NetworkWithCollectionsData[];
    search: (searchQuery: string) => void;
    query: string;
    isSearching: boolean;
    reportCollection: (address: string) => void;
    selectedChainIds: number[];
    setSelectedChainIds: (chainIds: number[]) => void;
}

export const useCollections = ({
    onSearchError,
    showHidden,
    sortBy,
    view,
}: {
    view: CollectionDisplayType;
    showHidden: boolean;
    sortBy: string | null;
    onSearchError: (error: unknown) => void;
}): CollectionsState => {
    const [isLoading, setIsLoading] = useState(true);
    const isLoadingMore = useRef(false);
    const [collections, setCollections] = useState<App.Data.Collections.CollectionData[]>([]);
    const [nfts, setNfts] = useState<App.Data.Collections.CollectionNftData[]>([]);
    const [pageMeta, setPageMeta] = useState({ currentPage: 1, lastPage: 1 });

    const [hiddenCollectionAddresses, setHiddenCollectionAddresses] = useState<string[]>([]);
    const [alreadyReportedByCollection, setAlreadyReportedByCollection] = useState<AlreadyReportedByCollection>({});
    const [reportByCollectionAvailableIn, setSeportByCollectionAvailableIn] = useState<ReportByCollectionAvailableIn>(
        {},
    );
    const [availableNetworks, setAvailableNetworks] = useState<App.Data.Network.NetworkWithCollectionsData[]>([]);
    const [selectedChainIds, setSelectedChainIds] = useState<number[]>(getAllChains());
    const { headers } = useInertiaHeader();

    const fetchCollections = async ({
        query = "",
        page = 1,
        showHidden = false,
        sort = null,
    }: QueryParameters = {}): Promise<CollectionsResponse> => {
        setIsLoading(true);
        isLoadingMore.current = true;

        let pageUrlWithSearch = replaceUrlQuery({
            query,
            page: isNumber(page) && Number(page) !== 1 ? page.toString() : "",
            sort: sort ?? "",
            showHidden: showHidden ? "true" : "",
            view,
        });

        if (selectedChainIds.length > 0) {
            pageUrlWithSearch += `&chain=${selectedChainIds.join(",")}`;
        }

        const { data } = await axios.get<CollectionsResponse>(pageUrlWithSearch, {
            requestId: "collections-page",
            headers,
        });

        const existingCollections = page === 1 ? [] : collections;

        if (page !== 1) {
            setCollections([...existingCollections, ...data.collections.data]);
            setNfts((existing) => [...existing, ...data.nfts]);
        } else {
            setCollections(data.collections.data);
            setNfts(data.nfts);
        }
        setHiddenCollectionAddresses(data.hiddenCollectionAddresses);
        setAlreadyReportedByCollection(data.alreadyReportedByCollection);
        setSeportByCollectionAvailableIn(data.reportByCollectionAvailableIn);
        setAvailableNetworks(data.availableNetworks);

        if (showHidden && data.hiddenCollectionAddresses.length === 0) {
            replaceUrlQuery({ showHidden: "" });
        }

        setPageMeta({
            currentPage: data.collections.meta.current_page,
            lastPage: data.collections.meta.last_page,
        });

        isLoadingMore.current = false;
        setIsLoading(false);

        return data;
    };

    const {
        query,
        setQuery,
        loading: isSearching,
    } = useLiveSearch({
        request: async (query: string) => await fetchCollections({ query, showHidden, sort: sortBy, selectedChainIds }),
        onError: onSearchError,
    });

    const loadMore = (): void => {
        if (isLoading || isLoadingMore.current) {
            return;
        }

        if (pageMeta.currentPage === pageMeta.lastPage) {
            return;
        }

        void fetchCollections({
            page: pageMeta.currentPage + 1,
            query,
            showHidden,
            selectedChainIds,
            sort: sortBy,
        });
    };

    const reload = (options: { showHidden?: boolean; page?: number; selectedChainIds?: number[] } = {}): void => {
        setCollections([]);

        void fetchCollections({
            page: pageMeta.currentPage,
            query,
            showHidden,
            selectedChainIds,
            sort: sortBy,
            ...options,
        });
    };

    const search = useCallback(
        (searchQuery: string) => {
            setQuery(searchQuery);

            if (!isTruthy(searchQuery)) {
                void fetchCollections({ sort: sortBy, showHidden, selectedChainIds });
            }
        },
        [setQuery, setCollections, sortBy, showHidden],
    );

    return {
        collections,
        nfts,
        isLoading: isLoading && collections.length === 0 && !isTruthy(query),
        loadMore,
        reload,
        hiddenCollectionAddresses,
        alreadyReportedByCollection,
        reportByCollectionAvailableIn,
        availableNetworks,
        search,
        query,
        isSearching,
        reportCollection: (address: string) => {
            alreadyReportedByCollection[address] = true;
            setAlreadyReportedByCollection(alreadyReportedByCollection);
        },
        selectedChainIds,
        setSelectedChainIds,
    };
};
