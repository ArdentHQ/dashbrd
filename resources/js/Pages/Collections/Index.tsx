import { type PageProps } from "@inertiajs/core";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCollections } from "./Hooks";
import { CollectionsGrid } from "@/Components/Collections/CollectionsGrid";
import { CollectionsTable } from "@/Components/Collections/CollectionsTable";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { useToasts } from "@/Hooks/useToasts";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { CollectionDisplayType, CollectionsFilter } from "@/Pages/Collections/Components/CollectionsFilter";
import { CollectionsHeading } from "@/Pages/Collections/Components/CollectionsHeading";
import { getQueryParameters } from "@/Utils/get-query-parameters";
import { isTruthy } from "@/Utils/is-truthy";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

const sort = ({
    sortBy,
    direction,
    selectedChainIds,
}: {
    sortBy: string;
    direction?: string;
    selectedChainIds?: number[];
}): void => {
    router.get(
        route("collections"),
        {
            ...getQueryParameters(),
            sort: sortBy,
            direction,
            chain: isTruthy(selectedChainIds) && selectedChainIds.length > 0 ? selectedChainIds.join(",") : undefined,
        },
        {
            preserveState: false,
        },
    );
};

const CollectionsIndex = ({
    auth,
    initialStats,
    title,
    sortBy = "received",
    sortDirection,
    selectedChainIds: initialSelectedChainIds,
}: {
    title: string;
    auth: PageProps["auth"];
    initialStats: App.Data.Collections.CollectionStatsData;
    sortBy: string | null;
    sortDirection: "asc" | "desc";
    selectedChainIds?: string[];
}): JSX.Element => {
    const { props } = usePage();

    const { t } = useTranslation();
    const queryParameters = getQueryParameters();

    const [displayType, setDisplayType] = useState(
        queryParameters.view === "grid" ? CollectionDisplayType.Grid : CollectionDisplayType.List,
    );

    const { showToast } = useToasts();

    const showHidden = queryParameters.showHidden === "true";

    const {
        collections,
        isLoading,
        loadMore,
        reload,
        hiddenCollectionAddresses,
        alreadyReportedByCollection,
        reportByCollectionAvailableIn,
        availableNetworks,
        query,
        stats,
        search,
        isSearching,
        reportCollection,
        selectedChainIds,
        setSelectedChainIds,
    } = useCollections({
        showHidden,
        sortBy,
        view: displayType,
        initialStats,
        onSearchError: () => {
            showToast({
                message: t("pages.collections.search.error"),
                type: "error",
            });
        },
        initialSelectedChainIds,
    });

    const selectDisplayTypeHandler = (displayType: CollectionDisplayType): void => {
        setDisplayType(displayType);

        replaceUrlQuery({
            view: displayType,
        });
    };

    const handleSelectedChainIds = (chainId: number): void => {
        const chainIds = selectedChainIds.includes(chainId)
            ? selectedChainIds.filter((id) => id !== chainId)
            : [...selectedChainIds, chainId];

        setSelectedChainIds(chainIds);
    };

    useEffect(() => {
        if (!auth.authenticated) {
            return;
        }

        reload({ selectedChainIds });
    }, [selectedChainIds, auth.authenticated]);

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />
            <div>
                <div className="mx-6 sm:mx-8 2xl:mx-0">
                    <CollectionsHeading
                        stats={stats}
                        currency={auth.user?.attributes.currency ?? "USD"}
                    />

                    <CollectionsFilter
                        isLoading={isLoading}
                        displayType={displayType}
                        disabled={stats.collections === 0}
                        onSelectDisplayType={selectDisplayTypeHandler}
                        showHidden={showHidden}
                        hiddenCount={hiddenCollectionAddresses.length}
                        searchQuery={query}
                        setSearchQuery={search}
                        activeSort={sortBy ?? "received"}
                        onSort={sort}
                        onChangeVisibilityStatus={(isHidden) => {
                            reload({ showHidden: isHidden, selectedChainIds, page: 1 });
                        }}
                        availableNetworks={availableNetworks}
                        handleSelectedChainIds={handleSelectedChainIds}
                        selectedChainIds={selectedChainIds}
                        collectionsCount={collections.length}
                    />
                </div>

                <div className="mx-6 mt-4 sm:mx-8 2xl:mx-0">
                    {!isLoading && collections.length === 0 && (
                        <div className="mt-7">
                            {isSearching ? (
                                <EmptyBlock>{t("pages.collections.search.loading_results")}</EmptyBlock>
                            ) : (
                                <>
                                    {query !== "" ? (
                                        <EmptyBlock>{t("pages.collections.search.no_results")}</EmptyBlock>
                                    ) : (
                                        <>
                                            {hiddenCollectionAddresses.length === 0 ? (
                                                <EmptyBlock>{t("pages.collections.no_collections")}</EmptyBlock>
                                            ) : (
                                                <EmptyBlock>{t("pages.collections.all_collections_hidden")}</EmptyBlock>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {displayType === CollectionDisplayType.List && (
                        <CollectionsTable
                            activeSort={sortBy ?? undefined}
                            sortDirection={sortDirection}
                            onSort={sort}
                            isLoading={isLoading}
                            collections={collections}
                            hiddenCollectionAddresses={hiddenCollectionAddresses}
                            user={auth.user}
                            reportByCollectionAvailableIn={reportByCollectionAvailableIn}
                            alreadyReportedByCollection={alreadyReportedByCollection}
                            reportReasons={props.reportReasons}
                            onLoadMore={loadMore}
                            onChanged={() => {
                                reload({ page: 1 });
                            }}
                            onReportCollection={reportCollection}
                            selectedChainIds={selectedChainIds}
                        />
                    )}

                    {displayType === CollectionDisplayType.Grid && (
                        <CollectionsGrid
                            isLoading={isLoading}
                            collections={collections}
                            hiddenCollectionAddresses={hiddenCollectionAddresses}
                            reportByCollectionAvailableIn={reportByCollectionAvailableIn}
                            alreadyReportedByCollection={alreadyReportedByCollection}
                            reportReasons={props.reportReasons}
                            onLoadMore={loadMore}
                            onChanged={reload}
                            onReportCollection={reportCollection}
                        />
                    )}
                </div>
            </div>
        </DefaultLayout>
    );
};

export default CollectionsIndex;
