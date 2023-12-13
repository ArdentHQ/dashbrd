import { type FormDataConvertible } from "@inertiajs/core";
import { type VisitOptions } from "@inertiajs/core/types/types";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/Hooks/useDebounce";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";
import { type ChainFilter } from "@/Pages/Collections/Components/PopularCollectionsFilters";
import { type PopularCollectionsSortBy } from "@/Pages/Collections/Components/PopularCollectionsSorting";

export interface Filters extends Record<string, FormDataConvertible> {
    chain?: ChainFilter;
    sort?: PopularCollectionsSortBy;
    query?: string;
}

interface CollectionFiltersState {
    currentFilters: Filters;
    setSortBy: (sort: PopularCollectionsSortBy | undefined) => void;
    setChain: (sort: ChainFilter | undefined) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}
export const useCollectionFilters = ({
    filters,
    filterRoute,
    options,
}: {
    filters: Filters;
    filterRoute: string;
    options?: Exclude<VisitOptions, "method" | "data">;
}): CollectionFiltersState => {
    const [currentFilters, setCurrentFilters] = useState<Filters>(filters);

    const [searchQuery, setSearchQuery] = useState<string>(filters.query ?? "");

    const [debouncedQuery] = useDebounce(searchQuery, 400);

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        router.get(filterRoute, currentFilters, options);
    }, [currentFilters]);

    useEffect(() => {
        if (isFirstRender) return;

        setCurrentFilters((filters) => ({
            ...filters,
            query: debouncedQuery,
        }));
    }, [debouncedQuery]);

    const setChain = (chain: ChainFilter | undefined): void => {
        setCurrentFilters((filters) => ({
            ...filters,
            chain,
        }));
    };

    const setSortBy = (sort: PopularCollectionsSortBy | undefined): void => {
        setCurrentFilters((filters) => ({
            ...filters,
            sort,
        }));
    };

    return {
        currentFilters,
        setChain,
        setSortBy,
        searchQuery,
        setSearchQuery,
    };
};
