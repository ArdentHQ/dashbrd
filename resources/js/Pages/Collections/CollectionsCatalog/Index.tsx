import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type RouteParamsWithQueryOverload } from "ziggy-js";
import { CollectionsFullTable } from "@/Components/Collections/CollectionsFullTable";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { useDebounce } from "@/Hooks/useDebounce";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { CollectionsFilterPopover } from "@/Pages/Collections/Components/CollectionsFilterPopover";
import {
    type ChainFilter,
    ChainFilters,
    type PeriodFilterOptions,
    PeriodFilters,
} from "@/Pages/Collections/Components/CollectionsFilterTabs";
import { CollectionsFullTablePagination } from "@/Pages/Collections/Components/CollectionsFullTablePagination/CollectionsFullTablePagination";
import { CollectionsHeading } from "@/Pages/Collections/Components/CollectionsHeading";
import {
    type CollectionsSortByOption,
    CollectionsSortingTabs,
} from "@/Pages/Collections/Components/CollectionsSortingTabs";
import { type Filters, type SortByDirection } from "@/Pages/Collections/Hooks/useCollectionFilters";

const Index = ({
    auth,
    stats,
    title,
    filters,
}: {
    title: string;
    auth: PageProps["auth"];
    stats: App.Data.Collections.CollectionStatsData;
    sortBy: string | null;
    sortDirection: "asc" | "desc";
    selectedChainIds?: string[];
    filters: Filters;
}): JSX.Element => {
    const { props } = usePage();
    const { t } = useTranslation();
    const { isXs } = useBreakpoint();

    const [currentFilters, setCurrentFilters] = useState(filters);

    const [query, setQuery] = useState(currentFilters.query ?? "");

    const [debouncedQuery] = useDebounce(query, 500);

    useEffect(() => {
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

    const { data, isLoading } = useQuery({
        queryKey: ["all-popular-collections", currentFilters],
        refetchOnWindowFocus: false,
        select: ({ data }) => data.collections,
        queryFn: async () => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const url = route("api:all-popular-collections", {
                _query: currentFilters,
            } as RouteParamsWithQueryOverload);

            return await axios.get<{
                collections: PaginationData<App.Data.Collections.CollectionData>;
            }>(url);
        },
    });

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />

            <div>
                <div className="mx-6 sm:mx-8 2xl:mx-0">
                    <CollectionsHeading
                        stats={stats}
                        currency={auth.user?.attributes.currency ?? "USD"}
                    />

                    <div className="mt-6 flex items-center justify-between">
                        <div className="hidden items-center justify-between md-lg:flex">
                            <div className="flex space-x-3">
                                <CollectionsSortingTabs
                                    sortBy={currentFilters.sort}
                                    setSortBy={setSortBy}
                                />

                                <PeriodFilters
                                    period={currentFilters.period}
                                    setPeriod={setPeriod}
                                    sortBy={currentFilters.sort}
                                />

                                <ChainFilters
                                    chain={currentFilters.chain}
                                    setChain={setChain}
                                />
                            </div>
                        </div>

                        <SearchInput
                            className="w-full md-lg:w-80"
                            query={query}
                            onChange={setQuery}
                            placeholder={isXs ? t("common.search") : t("pages.collections.search_by_name")}
                        />

                        <div className="ml-3 sm:relative md-lg:hidden">
                            <CollectionsFilterPopover
                                sortBy={currentFilters.sort}
                                setSortBy={setSortBy}
                                chain={currentFilters.chain}
                                setChain={setChain}
                                period={currentFilters.period}
                                setPeriod={setPeriod}
                            />
                        </div>
                    </div>
                </div>

                <div className="mx-6 mt-1 sm:mx-8 2xl:mx-0">
                    <CollectionsFullTable
                        collections={data?.data ?? []}
                        user={auth.user}
                        setSortBy={setSortBy}
                        activeSort={currentFilters.sort ?? ''}
                        direction={currentFilters.direction}
                        activePeriod={filters.period}
                        isLoading={isLoading}
                    />

                    {!isLoading && data?.data.length === 0 && (
                        <EmptyBlock>{t("pages.collections.search.no_results")}</EmptyBlock>
                    )}

                    {data !== undefined && !isLoading && (
                        <div className="mt-2">
                            <CollectionsFullTablePagination
                                pagination={data}
                                onPageLimitChange={setPerPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </DefaultLayout>
    );
};

export default Index;
