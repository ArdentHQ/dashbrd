import { Tab } from "@headlessui/react";
import { type PageProps } from "@inertiajs/core";
import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CollectionHeading } from "./Components/CollectionHeading";
import { CollectionNavigation, type TabName } from "./Components/CollectionNavigation";
import { CollectionNftsGrid } from "./Components/CollectionNftsGrid";
import { NftsSorting } from "./Components/CollectionNftsGrid/NftsSorting";
import { CollectionOwnedToggle } from "./Components/CollectionOwnedToggle";
import { CollectionPropertiesFilter } from "./Components/CollectionPropertiesFilter";
import { IconButton } from "@/Components/Buttons";
import { CollectionActivityTable } from "@/Components/Collections/CollectionActivityTable";
import { CollectionHiddenModal } from "@/Components/Collections/CollectionHiddenModal";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { ExternalLinkContextProvider } from "@/Contexts/ExternalLinkContext";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { useToasts } from "@/Hooks/useToasts";
import { useWalletActivity } from "@/Hooks/useWalletActivity";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { ArticlesTab } from "@/Pages/Collections/Components/Articles/ArticlesTab";
import { CollectionFilterSlider } from "@/Pages/Collections/Components/CollectionFilterSlider/CollectionFilterSlider";
import { isTruthy } from "@/Utils/is-truthy";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

export type TraitsFilters = Record<string, Array<{ value: string; displayType: string }> | undefined> | null;

interface Properties {
    title: string;
    auth: PageProps["auth"];
    collection: App.Data.Collections.CollectionDetailData;
    isHidden: boolean;
    previousUrl: string;
    nfts: App.Data.Gallery.GalleryNftsData;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    collectionTraits: App.Data.Collections.CollectionTraitFilterData[];
    appliedFilters: {
        traits: TraitsFilters;
        owned: boolean;
        tab: "activity" | "collection";
        pageLimit: number;
        query: string;
        nftPageLimit: number;
    };
    initialActivities: App.Data.Nfts.NftActivitiesData | null;
    hasActivities: boolean;
    sortByMintDate?: boolean;
    nativeToken: App.Data.Token.TokenData;
    showReportModal: boolean;
}

const CollectionsView = ({
    auth,
    collection,
    title,
    isHidden,
    previousUrl,
    nfts,
    initialActivities,
    alreadyReported = false,
    reportAvailableIn,
    collectionTraits,
    appliedFilters,
    hasActivities,
    sortByMintDate = false,
    nativeToken,
    showReportModal,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { props } = usePage();

    const [selectedTab, setSelectedTab] = useState<TabName>(appliedFilters.tab);
    const [activityPageLimit, setActivityPageLimit] = useState<number>(appliedFilters.pageLimit);
    const [nftPageLimit, setNftPageLimit] = useState<number>(appliedFilters.nftPageLimit);
    const [selectedTraits, setSelectedTraits] = useState<TraitsFilters>(appliedFilters.traits);
    const [showOnlyOwned, setShowOnlyOwned] = useState<boolean>(appliedFilters.owned);
    const [filterIsDirty, setFilterIsDirty] = useState(false);
    const [query, setQuery] = useState("");
    const [activities, setActivities] = useState(initialActivities);

    const [loading, setLoading] = useState(false);
    const [isLoadingActivity, setIsLoadingActivity] = useState(collection.isFetchingActivity);

    const [showCollectionFilterSlider, setShowCollectionFilterSlider] = useState(false);
    const { requestActivityUpdate } = useWalletActivity();

    const { authenticatedAction } = useAuthorizedAction();
    const { showToast } = useToasts();

    const hasSelectedTraits = useMemo(
        () =>
            selectedTraits !== null &&
            Object.values(selectedTraits).some((traits) => traits !== undefined && traits.length > 0),
        [selectedTraits],
    );

    const filters = useMemo(() => {
        if (selectedTab === "articles") {
            return {
                tab: selectedTab,
                activityPageLimit: activityPageLimit === 10 ? undefined : activityPageLimit,
            };
        }

        if (selectedTab === "activity") {
            return {
                tab: selectedTab,
                activityPageLimit: activityPageLimit === 10 ? undefined : activityPageLimit,
            };
        }

        return {
            traits: hasSelectedTraits ? selectedTraits : undefined,
            owned: showOnlyOwned,
            tab: undefined,
            sort: sortByMintDate ? "minted" : undefined,
            query: isTruthy(query) ? query : undefined,
            nftPageLimit: nftPageLimit === 10 ? undefined : nftPageLimit,
        };
    }, [selectedTraits, showOnlyOwned, selectedTab, activityPageLimit, nftPageLimit, query, hasSelectedTraits]);

    useEffect(() => {
        if (!filterIsDirty) {
            return;
        }

        setFilterIsDirty(false);

        router.get(
            route("collections.view", {
                slug: collection.slug,
            }),
            filters,
            {
                preserveScroll: true,
                preserveState: true,
                queryStringArrayFormat: "indices",
                replace: true,
                onBefore: () => {
                    setLoading(true);
                },
                onSuccess: (event) => {
                    setActivities(event.props.initialActivities as App.Data.Nfts.NftActivitiesData | null);

                    setLoading(false);
                },
            },
        );
    }, [filterIsDirty, filters]);

    const selectedTraitsSetHandler = (
        previous: TraitsFilters,
        groupName: string,
        value: string,
        displayType: string,
    ): TraitsFilters => {
        if (previous === null) {
            return {
                [groupName]: [{ value, displayType }],
            };
        }

        const previousValues = previous[groupName] ?? [];

        if (previousValues.some((v) => v.value === value)) {
            return {
                ...previous,
                [groupName]: previousValues.filter((v) => v.value !== value),
            };
        }

        return {
            ...previous,
            [groupName]: [...previousValues, { value, displayType }],
        };
    };

    const traitChangedHandler = (groupName: string, value: string, displayType: string): void => {
        setSelectedTraits((previous) => selectedTraitsSetHandler(previous, groupName, value, displayType));

        setFilterIsDirty(true);
    };

    const ownedChangedHandler = (checked: boolean): void => {
        setShowOnlyOwned(checked);

        setFilterIsDirty(true);
    };

    const tabChangeHandler = (tab: TabName): void => {
        setSelectedTab(tab);
        setFilterIsDirty(true);
        replaceUrlQuery({
            tab,
        });
    };

    const activityPageLimitChangeHandler = (pageLimit: number): void => {
        setActivityPageLimit(pageLimit);

        setFilterIsDirty(true);
    };

    const nftsPageLimitChangeHandler = (pageLimit: number): void => {
        setNftPageLimit(pageLimit);

        setFilterIsDirty(true);
    };

    const setFilters = (showOnlyOwned: boolean, selectedTraits: TraitsFilters): void => {
        setShowOnlyOwned(showOnlyOwned);
        setSelectedTraits(selectedTraits);

        setFilterIsDirty(true);
    };

    const sort = (column: string): void => {
        router.get(
            route("collections.view", {
                slug: collection.slug,
            }),
            { ...filters, sort: column === "minted" ? "minted" : undefined },
            {
                preserveScroll: false,
                preserveState: false,
                queryStringArrayFormat: "indices",
                replace: true,
            },
        );
    };

    const renderNoResults = ({
        hasTraitsFiltered,
        hasQuery,
    }: {
        hasTraitsFiltered: boolean;
        hasQuery: boolean;
    }): JSX.Element => {
        if (hasTraitsFiltered) {
            return <EmptyBlock>{t("pages.collections.search.no_results_with_filters")}</EmptyBlock>;
        }

        if (hasQuery) {
            return <EmptyBlock>{t("pages.collections.search.no_results")}</EmptyBlock>;
        }

        return <EmptyBlock>{t("pages.collections.search.no_results_ownership")}</EmptyBlock>;
    };

    const renderActivities = (): JSX.Element => {
        if (!hasActivities) {
            return <EmptyBlock>{t("pages.collections.activities.ignores_activities")}</EmptyBlock>;
        }

        if (isTruthy(isLoadingActivity) && activities?.paginated.data.length === 0) {
            return <EmptyBlock>{t("pages.collections.activities.loading_activities_collection")}</EmptyBlock>;
        }

        if (!loading && (activities === null || activities.paginated.data.length === 0)) {
            return <EmptyBlock>{t("pages.collections.activities.no_activity")}</EmptyBlock>;
        }

        return (
            <CollectionActivityTable
                collection={collection}
                activities={activities}
                isLoading={loading}
                showNameColumn
                pageLimit={activityPageLimit}
                onPageLimitChange={activityPageLimitChangeHandler}
                nativeToken={nativeToken}
            />
        );
    };

    const handleRefreshActivity = (): void => {
        void authenticatedAction(async () => {
            setIsLoadingActivity(true);
            requestActivityUpdate(collection.address);

            showToast({
                message: t("common.refreshing_activity"),
                isExpanded: true,
            });

            await axios.post(
                route("collection.refresh-activity", {
                    collection: collection.slug,
                }),
            );
        });
    };

    return (
        <ExternalLinkContextProvider allowedExternalDomains={props.allowedExternalDomains}>
            <DefaultLayout toastMessage={props.toast}>
                <Head title={title} />

                {isHidden && (
                    <CollectionHiddenModal
                        previousUrl={previousUrl}
                        collection={collection}
                    />
                )}
                <div className="mx-6 sm:mx-8 2xl:mx-0">
                    <CollectionHeading
                        reportReasons={props.reportReasons}
                        collection={collection}
                        alreadyReported={alreadyReported}
                        reportAvailableIn={reportAvailableIn}
                        showReportModal={showReportModal}
                    />

                    <CollectionNavigation
                        collection={collection}
                        hasActivities={hasActivities}
                        selectedTab={selectedTab}
                        onTabChange={tabChangeHandler}
                        onRefreshActivity={handleRefreshActivity}
                        isLoadingActivity={isLoadingActivity}
                    >
                        <Tab.Panel>
                            <div className="mt-6 flex lg:space-x-6">
                                <div className="hidden w-full max-w-[304px] space-y-3 lg:block">
                                    {auth.user !== null && (
                                        <CollectionOwnedToggle
                                            checked={showOnlyOwned}
                                            onChange={ownedChangedHandler}
                                            ownedNftsCount={collection.nftsCount}
                                        />
                                    )}

                                    <CollectionPropertiesFilter
                                        traits={collectionTraits}
                                        changeHandler={traitChangedHandler}
                                        selected={selectedTraits}
                                    />
                                </div>

                                <div className="flex-1">
                                    <div className="mb-3 flex items-center justify-between gap-x-3">
                                        <div className="flex-1">
                                            <SearchInput
                                                placeholder={t("pages.galleries.create.search_by_nfts")}
                                                query={query}
                                                onChange={(query) => {
                                                    setQuery(query);
                                                    setFilterIsDirty(true);
                                                }}
                                            />
                                        </div>

                                        <div className="order-last block md-lg:order-none lg:hidden">
                                            <IconButton
                                                icon="Funnel"
                                                onClick={() => {
                                                    setShowCollectionFilterSlider(true);
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <NftsSorting
                                                activeSort={sortByMintDate ? "minted" : "id"}
                                                onSort={sort}
                                            />
                                        </div>
                                    </div>

                                    {nfts.paginated.data.length === 0 ? (
                                        renderNoResults({
                                            hasTraitsFiltered: hasSelectedTraits,
                                            hasQuery: query !== "",
                                        })
                                    ) : (
                                        <CollectionNftsGrid
                                            nfts={nfts}
                                            pageLimit={nftPageLimit}
                                            onPageLimitChange={nftsPageLimitChangeHandler}
                                        />
                                    )}
                                </div>
                            </div>
                        </Tab.Panel>

                        <Tab.Panel>
                            <ArticlesTab collection={collection} />
                        </Tab.Panel>

                        <Tab.Panel>
                            <div className="mt-6">{renderActivities()}</div>
                        </Tab.Panel>
                    </CollectionNavigation>
                </div>
                <CollectionFilterSlider
                    open={showCollectionFilterSlider}
                    traits={collectionTraits}
                    ownedNftsCount={collection.nftsCount}
                    defaultShowOnlyOwned={showOnlyOwned}
                    defaultSelectedTraits={selectedTraits}
                    onClose={() => {
                        setShowCollectionFilterSlider(false);
                    }}
                    selectedTraitsSetHandler={selectedTraitsSetHandler}
                    setFilters={setFilters}
                    user={auth.user}
                />
            </DefaultLayout>
        </ExternalLinkContextProvider>
    );
};

export default CollectionsView;
