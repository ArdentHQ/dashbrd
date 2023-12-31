import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { CollectionsFullTable } from "@/Components/Collections/CollectionsFullTable";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { CollectionsFilterPopover } from "@/Pages/Collections/Components/CollectionsFilterPopover";
import { ChainFilters, PeriodFilters } from "@/Pages/Collections/Components/CollectionsFilterTabs";
import { CollectionsFullTablePagination } from "@/Pages/Collections/Components/CollectionsFullTablePagination/CollectionsFullTablePagination";
import { CollectionsHeading } from "@/Pages/Collections/Components/CollectionsHeading";
import { CollectionsSortingTabs } from "@/Pages/Collections/Components/CollectionsSortingTabs";
import { type Filters, useCollectionFilters } from "@/Pages/Collections/Hooks/useCollectionFilters";

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

    const { isXs } = useBreakpoint();

    const { currentFilters, setChain, setSortBy, setPeriod, searchQuery, setSearchQuery, setPerPage } =
        useCollectionFilters({
            filters,
            filterRoute: route("popular-collections"),
            options: {
                preserveState: true,
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
                            query={searchQuery}
                            onChange={setSearchQuery}
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
                        collections={collections.data}
                        user={auth.user}
                        setSortBy={setSortBy}
                        activeSort={currentFilters.sort ?? ""}
                        direction={currentFilters.direction}
                    />

                    {collections.data.length === 0 && (
                        <EmptyBlock>{t("pages.collections.search.no_results")}</EmptyBlock>
                    )}

                    <div className="mt-2">
                        <CollectionsFullTablePagination
                            pagination={collections}
                            onPageLimitChange={setPerPage}
                        />
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default Index;
