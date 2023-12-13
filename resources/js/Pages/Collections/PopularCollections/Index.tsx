import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { CollectionsFullTable } from "@/Components/Collections/CollectionsFullTable";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { CollectionsFullTablePagination } from "@/Pages/Collections/Components/CollectionsFullTablePagination/CollectionsFullTablePagination";
import { ChainFilters } from "@/Pages/Collections/Components/PopularCollectionsFilters";
import { PopularCollectionsHeading } from "@/Pages/Collections/Components/PopularCollectionsHeading";
import { PopularCollectionsSorting } from "@/Pages/Collections/Components/PopularCollectionsSorting";
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

    const { currentFilters, setChain, setSortBy, searchQuery, setSearchQuery } = useCollectionFilters({
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
                    <PopularCollectionsHeading
                        stats={stats}
                        currency={auth.user?.attributes.currency ?? "USD"}
                    />
                    <div className="mt-6 flex items-center justify-between">
                        <div className="hidden items-center justify-between md-lg:flex">
                            <div className="flex space-x-3">
                                <PopularCollectionsSorting
                                    sortBy={currentFilters.sort}
                                    setSortBy={setSortBy}
                                />

                                <ChainFilters
                                    chain={currentFilters.chain}
                                    setChain={setChain}
                                />
                            </div>
                        </div>
                        <SearchInput
                            className="w-full lg:w-80"
                            query={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search by Collection Name"
                        />
                    </div>
                </div>

                <div className="mx-6 mt-1 sm:mx-8 2xl:mx-0">
                    <CollectionsFullTable
                        collections={collections.data}
                        user={auth.user}
                    />

                    {collections.data.length === 0 && (
                        <EmptyBlock>{t("pages.collections.search.no_results")}</EmptyBlock>
                    )}

                    <div className="mt-2">
                        <CollectionsFullTablePagination
                            pagination={collections}
                            onPageLimitChange={() => 1}
                        />
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default Index;
