import { type FormDataConvertible } from "@inertiajs/core";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";
import { type ChainFilter, type PeriodFilterOptions } from "@/Pages/Collections/Components/PopularCollectionsFilters";
import { type PopularCollectionsSortBy } from "@/Pages/Collections/Components/PopularCollectionsSorting/PopularCollectionsSorting";

export interface Filters extends Record<string, FormDataConvertible> {
    chain?: ChainFilter;
    sort?: PopularCollectionsSortBy;
    period?: PeriodFilterOptions;
}

export const useCollectionFilters = ({
    filters,
    route,
}: {
    filters: Filters;
    route: string;
}): {
    setChain: (chain: ChainFilter | undefined) => void;
    setPeriod: (period: PeriodFilterOptions | undefined) => void;
    setSortBy: (sort: PopularCollectionsSortBy | undefined) => void;
    currentFilters: Filters;
} => {
    const [currentFilters, setCurrentFilters] = useState<Filters>(filters);

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        router.get(route, currentFilters, {
            only: ["collections", "filters"],
            preserveScroll: true,
            preserveState: true,
        });
    }, [currentFilters]);

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

    const setSortBy = (sort: PopularCollectionsSortBy | undefined): void => {
        setCurrentFilters((filters) => ({
            ...filters,
            period: sort === "floor-price" ? undefined : filters.period,
            sort,
        }));
    };

    return {
        setChain,
        setPeriod,
        setSortBy,
        currentFilters,
    };
};
