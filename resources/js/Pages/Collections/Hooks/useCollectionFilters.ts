import { type FormDataConvertible } from "@inertiajs/core";
import { type VisitOptions } from "@inertiajs/core/types/types";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/Hooks/useDebounce";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";
import { type ChainFilter, type PeriodFilterOptions } from "@/Pages/Collections/Components/CollectionsFilterTabs";
import { type CollectionsSortByOption } from "@/Pages/Collections/Components/CollectionsSortingTabs";

export type SortByDirection = "asc" | "desc";

export interface Filters extends Record<string, FormDataConvertible> {
    chain?: ChainFilter;
    sort?: CollectionsSortByOption;
    period?: PeriodFilterOptions;
    query?: string;
    perPage?: number;
    direction?: SortByDirection;
}

interface CollectionFiltersState {
    currentFilters: Filters;
    setSortBy: (sort: CollectionsSortByOption | undefined) => void;
    setChain: (sort: ChainFilter | undefined) => void;
    setPeriod: (period: PeriodFilterOptions | undefined) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setPerPage: (perPage: number) => void;
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
            query: debouncedQuery === "" ? undefined : debouncedQuery,
        }));
    }, [debouncedQuery]);

    const setChain = (chain: ChainFilter | undefined): void => {
        setCurrentFilters((filters) => ({
            ...filters,
            chain,
        }));
    };

    const setPeriod = (period: PeriodFilterOptions | undefined): void => {
        setCurrentFilters((filters) => ({
            ...filters,
            period,
        }));
    };

    const setSortBy = (sort: CollectionsSortByOption | undefined, direction?: SortByDirection): void => {
        setCurrentFilters((filters) => ({
            ...filters,
            period: sort === undefined ? filters.period : undefined,
            sort,
            direction,
        }));
    };

    const setPerPage = (perPage: number): void => {
        setCurrentFilters((filters) => ({
            ...filters,
            perPage,
        }));
    };

    return {
        currentFilters,
        setChain,
        setSortBy,
        searchQuery,
        setSearchQuery,
        setPerPage,
        setPeriod,
    };
};
