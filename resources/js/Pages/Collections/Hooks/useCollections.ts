import { isNumber } from "@ardenthq/sdk-helpers";
import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { useInertiaHeader } from "@/Hooks/useInertiaHeader";
import { useLiveSearch } from "@/Hooks/useLiveSearch";
import { type CollectionDisplayType } from "@/Pages/Collections/Components/CollectionsFilter";
import { isTruthy } from "@/Utils/is-truthy";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

type ReportByCollectionAvailableIn = Record<string, string | null>;
type AlreadyReportedByCollection = Record<string, boolean>;

interface QueryParameters {
    page?: number;
    showHidden?: boolean;
    query?: string;
    sort?: string | null;
}

interface CollectionsResponse {
    collections: PaginationData<App.Data.Collections.CollectionData>;
    nfts: App.Data.Collections.CollectionNftData[];
    stats: App.Data.Collections.CollectionStatsData;
    reportByCollectionAvailableIn: ReportByCollectionAvailableIn;
    alreadyReportedByCollection: AlreadyReportedByCollection;
    hiddenCollectionAddresses: string[];
}

interface CollectionsState {
    loadMore: () => void;
    reload: ({ showHidden, page }?: { showHidden?: boolean; page?: number }) => void;
    collections: App.Data.Collections.CollectionData[];
    nfts: App.Data.Collections.CollectionNftData[];
    isLoading: boolean;
    reportByCollectionAvailableIn: ReportByCollectionAvailableIn;
    alreadyReportedByCollection: AlreadyReportedByCollection;
    hiddenCollectionAddresses: string[];
    stats: App.Data.Collections.CollectionStatsData;
    search: (searchQuery: string) => void;
    query: string;
    isSearching: boolean;
    reportCollection: (address: string) => void;
}

export const useCollections = ({
    onSearchError,
    showHidden,
    sortBy,
    view,
    initialStats = {
        nfts: 0,
        collections: 0,
        value: null,
    },
}: {
    view: CollectionDisplayType;
    initialStats: App.Data.Collections.CollectionStatsData;
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
    const [stats, setStats] = useState<App.Data.Collections.CollectionStatsData>(initialStats);
    const [alreadyReportedByCollection, setAlreadyReportedByCollection] = useState<AlreadyReportedByCollection>({});
    const [reportByCollectionAvailableIn, setSeportByCollectionAvailableIn] = useState<ReportByCollectionAvailableIn>(
        {},
    );

    const { headers } = useInertiaHeader();

    const fetchCollections = async ({
        query = "",
        page = 1,
        showHidden = false,
        sort = null,
    }: QueryParameters = {}): Promise<CollectionsResponse> => {
        setIsLoading(true);
        isLoadingMore.current = true;

        const pageUrlWithSearch = replaceUrlQuery({
            query,
            page: isNumber(page) && Number(page) !== 1 ? page.toString() : "",
            sort: sort ?? "",
            showHidden: showHidden ? "true" : "",
            view,
        });

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
        setStats(data.stats);
        setAlreadyReportedByCollection(data.alreadyReportedByCollection);
        setSeportByCollectionAvailableIn(data.reportByCollectionAvailableIn);

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
        request: async (query: string) => await fetchCollections({ query, showHidden, sort: sortBy }),
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
            sort: sortBy,
        });
    };

    const reload = (options: { showHidden?: boolean; page?: number } = {}): void => {
        setCollections([]);

        void fetchCollections({
            page: pageMeta.currentPage,
            query,
            showHidden,
            sort: sortBy,
            ...options,
        });
    };

    const search = useCallback(
        (searchQuery: string) => {
            setQuery(searchQuery);

            if (!isTruthy(searchQuery)) {
                void fetchCollections({ sort: sortBy, showHidden });
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
        search,
        query,
        stats,
        isSearching,
        reportCollection: (address: string) => {
            alreadyReportedByCollection[address] = true;
            setAlreadyReportedByCollection(alreadyReportedByCollection);
        },
    };
};
