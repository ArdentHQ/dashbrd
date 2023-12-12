import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { CollectionsFullTable } from "@/Components/Collections/CollectionsFullTable";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { CollectionsFullTablePagination } from "@/Pages/Collections/Components/PopularCollections/CollectionsFullTablePagination";
import { ChainFilters, PeriodFilters } from "@/Pages/Collections/Components/PopularCollectionsFilters";
import { PopularCollectionsHeading } from "@/Pages/Collections/Components/PopularCollectionsHeading";
import { PopularCollectionsSorting } from "@/Pages/Collections/Components/PopularCollectionsSorting";
import { type Filters, useCollectionFilters } from "@/Pages/Collections/Hooks/useCollectionsFilters";

const Index = ({
    auth,
    stats,
    title,
    collections,
    filters,
}: {
    title: string;
    auth: PageProps["auth"];
    stats: App.Data.Collections.CollectionStatsData;
    sortBy: string | null;
    sortDirection: "asc" | "desc";
    selectedChainIds?: string[];
    collections: PaginationData<App.Data.Collections.CollectionData>;
    filters: Filters;
}): JSX.Element => {
    const { props } = usePage();

    const { t } = useTranslation();

    // @TODO replace with real logic
    const isSearching = Math.random() === 0;
    const query = Math.random() === 0 ? "" : "1";

    const { setPeriod, setSortBy, setChain, currentFilters } = useCollectionFilters({
        filters,
        route: route("collections"),
    });

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />
            <div>
                <div className="mx-6 sm:mx-8 2xl:mx-0">
                    <PopularCollectionsHeading
                        stats={stats}
                        currency={auth.user?.attributes.currency ?? "USD"}
                    />
                    <div className="mt-6 hidden items-center justify-between md-lg:flex">
                        <div className="flex space-x-3">
                            <PopularCollectionsSorting
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
                </div>

                <div className="mx-6 mt-1 sm:mx-8 2xl:mx-0">
                    {collections.data.length === 0 && (
                        <div className="mt-7">
                            {isSearching ? (
                                <EmptyBlock>{t("pages.collections.search.loading_results")}</EmptyBlock>
                            ) : (
                                <>
                                    {query !== "" ? (
                                        <EmptyBlock>{t("pages.collections.search.no_results")}</EmptyBlock>
                                    ) : (
                                        <EmptyBlock>{t("pages.collections.no_collections")}</EmptyBlock>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <CollectionsFullTable
                        collections={collections.data}
                        user={auth.user}
                    />

                    <div className="mt-2">
                        <CollectionsFullTablePagination
                            pagination={collections}
                            onPageLimitChange={() => 1}
                            onPageChange={() => 2}
                        />
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default Index;
