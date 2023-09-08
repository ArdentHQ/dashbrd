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
import { replaceUrlQuery } from "@/Utils/replace-url-query";

const sort = (sortBy: string, direction?: string): void => {
    router.get(
        route("collections"),
        {
            ...getQueryParameters(),
            sort: sortBy,
            direction,
        },
        {
            preserveState: false,
        },
    );
};

const CollectionsIndex = ({
    auth,
    stats,
    title,
    sortBy,
    sortDirection,
}: {
    title: string;
    auth: PageProps["auth"];
    stats: App.Data.Collections.CollectionStatsData;
    sortBy: string | null;
    sortDirection: "asc" | "desc";
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
        nfts,
        isLoading,
        loadMore,
        reload,
        hiddenCollectionAddresses,
        alreadyReportedByCollection,
        reportByCollectionAvailableIn,
        query,
        search,
        isSearching,
        reportCollection,
    } = useCollections({
        showHidden,
        sortBy,
        view: displayType,
        onSearchError: () => {
            showToast({
                message: t("pages.collections.search.error"),
                type: "error",
            });
        },
    });

    useEffect(() => {
        if (!auth.authenticated) {
            return;
        }

        reload();
    }, [auth.authenticated]);

    const selectDisplayTypeHandler = (displayType: CollectionDisplayType): void => {
        setDisplayType(displayType);

        replaceUrlQuery({
            view: displayType,
        });
    };

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />

            <div>
                <div className="mx-6 sm:mx-8 2xl:mx-0">
                    <CollectionsHeading
                        value={stats.value}
                        collectionsCount={stats.collections}
                        nftsCount={stats.nfts}
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
                        activeSort={sortBy}
                        onSort={sort}
                        onChangeVisibilityStatus={(isHidden) => {
                            reload({ showHidden: isHidden });
                        }}
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
                            nfts={nfts}
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
                        />
                    )}

                    {displayType === CollectionDisplayType.Grid && (
                        <CollectionsGrid
                            isLoading={isLoading}
                            collections={collections}
                            nfts={nfts}
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
