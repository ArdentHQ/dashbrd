import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type RouteParamsWithQueryOverload } from "ziggy-js";
import { CollectionsFilterPopover } from "./Components/CollectionsFilterPopover";
import {
    type ChainFilter,
    ChainFilters,
    type PeriodFilterOptions,
    PeriodFilters,
} from "./Components/CollectionsFilterTabs";
import { type CollectionsSortByOption, CollectionsSortingTabs } from "./Components/CollectionsSortingTabs";
import { type Filters, type SortByDirection } from "./Hooks/useCollectionFilters";
import { ViewAllButton } from "./ViewAllButton";
import { PopularCollectionsTable } from "@/Components/Collections/PopularCollectionsTable";
import { Heading } from "@/Components/Heading";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";

interface Properties {
    auth: App.Data.AuthData;
    filters: Filters;
}

export const PopularCollections = ({ auth, filters }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const [currentFilters, setCurrentFilters] = useState(filters);

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

    const { data, isLoading } = useQuery({
        queryKey: ["popular-collections", currentFilters],
        refetchOnWindowFocus: false,
        select: ({ data }) => data.collections.data,
        queryFn: async () => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const url = route("api:popular-collections", {
                _query: currentFilters,
            } as RouteParamsWithQueryOverload);

            return await axios.get<{
                collections: PaginationData<App.Data.Collections.PopularCollectionData>;
            }>(url);
        },
    });

    return (
        <section>
            <div className="flex items-center justify-between">
                <Heading level={1}>{t("pages.collections.popular_collections")}</Heading>

                <div className="flex space-x-3 sm:relative md-lg:hidden">
                    <CollectionsFilterPopover
                        sortBy={currentFilters.sort}
                        setSortBy={setSortBy}
                        chain={currentFilters.chain}
                        setChain={setChain}
                        period={currentFilters.period}
                        setPeriod={setPeriod}
                    />

                    <ViewAllButton
                        className="hidden sm:inline"
                        filters={currentFilters}
                    />
                </div>
            </div>

            <div className="mt-4 hidden items-center justify-between md-lg:flex">
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

                <div>
                    <ViewAllButton filters={currentFilters} />
                </div>
            </div>

            <div>
                <div className="flex sm:space-x-2 md:space-x-3 md-lg:space-x-6">
                    <div className="flex-1">
                        <PopularCollectionsTable
                            collections={data?.slice(0, 6) ?? []}
                            user={auth.user}
                            period={currentFilters.period}
                            activePeriod={currentFilters.period}
                            isLoading={isLoading}
                        />
                    </div>

                    <div className="hidden flex-1 sm:block">
                        <PopularCollectionsTable
                            collections={data?.slice(6, 12) ?? []}
                            user={auth.user}
                            period={currentFilters.period}
                            activePeriod={currentFilters.period}
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                <div className="mt-2 sm:hidden">
                    <ViewAllButton filters={currentFilters} />
                </div>
            </div>
        </section>
    );
};
