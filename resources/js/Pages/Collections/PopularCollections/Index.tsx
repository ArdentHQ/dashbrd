import { type PageProps } from "@inertiajs/core";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PopularCollectionsTableFull } from "@/Components/Collections/PopularCollectionsTableFull";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { PopularCollectionsPagination } from "@/Pages/Collections/Components/PopularCollections/PopularCollectionsPagination";
import { type ChainFilter, ChainFilters } from "@/Pages/Collections/Components/PopularCollectionsFilters";
import { PopularCollectionsHeading } from "@/Pages/Collections/Components/PopularCollectionsHeading";
import {
    type PopularCollectionsSortBy,
    PopularCollectionsSorting,
} from "@/Pages/Collections/Components/PopularCollectionsSorting";
import { type Filters } from "@/Pages/Collections/Index";

const CollectionsIndex = ({
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

    const isSearching = false;

    const [currentFilters, setCurrentFilters] = useState<Filters>(filters);

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        router.get(route("popular-collections"), currentFilters);
    }, [currentFilters]);

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

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />
            <div>
                <div className="mx-6 sm:mx-8 2xl:mx-0">
                    <PopularCollectionsHeading
                        stats={stats}
                        currency={auth.user?.attributes.currency ?? "USD"}
                    />
                    <div className="mt-4 hidden items-center justify-between md-lg:flex">
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
                </div>

                <div className="mx-6 mt-4 sm:mx-8 2xl:mx-0">
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

                    <PopularCollectionsTableFull
                        collections={collections.data}
                        user={auth.user}
                    />

                    <PopularCollectionsPagination
                        pagination={collections}
                        onPageLimitChange={() => 1}
                        onPageChange={() => 2}
                    />
                </div>
            </div>
        </DefaultLayout>
    );
};

export default CollectionsIndex;
