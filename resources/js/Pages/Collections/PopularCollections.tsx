import { PopularCollectionsTable } from "@/Components/Collections/PopularCollectionsTable";
import { ChainFilter, ChainFilters, PeriodFilterOptions, PeriodFilters } from "./Components/CollectionsFilterTabs";
import { CollectionsSortByOption, CollectionsSortingTabs } from "./Components/CollectionsSortingTabs";
import { ViewAllButton } from "./Index";
import { Filters, SortByDirection, useCollectionFilters } from "./Hooks/useCollectionFilters";
import { PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { Heading } from "@/Components/Heading";
import { useTranslation } from "react-i18next";
import { CollectionsFilterPopover } from "./Components/CollectionsFilterPopover";
import { useEffect, useState } from "react";
import axios from "axios"

interface Props {
    auth: App.Data.AuthData;
    filters: Filters;
}

export const PopularCollections = ({ auth, filters }: Props) => {
    const [collections, setCollections] = useState<PaginationData<App.Data.Collections.PopularCollectionData>>()

    const { t } = useTranslation();
    const [currentFilters, setCurrentFilters] = useState(filters);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {

        (async () => {
            setLoading(true);

            const { data } = await axios.get<{
                collections: PaginationData<App.Data.Collections.PopularCollectionData>
            }>(route("collections", {
                _query: currentFilters
            }))

            setCollections(data.collections)

            setLoading(false);
        })()
    }, [currentFilters])

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
                            collections={collections?.data.slice(0, 6) ?? []}
                            user={auth.user}
                            period={currentFilters.period}
                            activePeriod={filters.period}
                            isLoading={loading}
                        />
                    </div>

                    <div className="hidden flex-1 sm:block">
                        <PopularCollectionsTable
                            collections={collections?.data.slice(6, 12) ?? []}
                            user={auth.user}
                            period={currentFilters.period}
                            activePeriod={filters.period}
                            isLoading={loading}
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
