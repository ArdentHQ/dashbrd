import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import cn from "classnames";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type RouteParams } from "ziggy-js";
import { CollectionsArticles } from "./Components/CollectionsArticles";
import { CollectionsCallToAction } from "./Components/CollectionsCallToAction";
import {
    CollectionsVoteReceivedModal,
    type TemporalVotableCollection,
} from "./Components/CollectionsVoteReceivedModal";
import { FeaturedCollectionsCarousel } from "./Components/FeaturedCollections";
import { PopularCollectionsFilterPopover } from "./Components/PopularCollectionsFilterPopover";
import { PopularCollectionsSorting } from "./Components/PopularCollectionsSorting";
import { Button } from "@/Components/Buttons";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { CollectionOfTheMonthWinners } from "@/Components/Collections/CollectionOfTheMonthWinners";
import { PopularCollectionsTable } from "@/Components/Collections/PopularCollectionsTable";
import { Heading } from "@/Components/Heading";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { VoteCollections } from "@/Pages/Collections/Components/CollectionVoting";
import { ChainFilters } from "@/Pages/Collections/Components/PopularCollectionsFilters";
import { type Filters, useCollectionFilters } from "@/Pages/Collections/Hooks/useCollectionFilters";

interface CollectionsIndexProperties extends PageProps {
    title: string;
    collections: PaginationData<App.Data.Collections.PopularCollectionData>;
    featuredCollections: App.Data.Collections.CollectionFeaturedData[];
    collectionsOfTheMonth: App.Data.Collections.CollectionOfTheMonthData[];
    votableCollections: App.Data.Collections.VotableCollectionData[];
    filters: Filters;
    collectionsTableResults: App.Data.Collections.CollectionData[];
    latestArticles: App.Data.Articles.ArticleData[];
    popularArticles: App.Data.Articles.ArticleData[];
    votedCollection: App.Data.Collections.VotableCollectionData | null;
}

const CollectionsIndex = ({
    title,
    featuredCollections,
    collections: { data: collections },
    collectionsOfTheMonth,
    votableCollections,
    votedCollection,
    auth,
    filters,
    latestArticles,
    popularArticles,
}: CollectionsIndexProperties): JSX.Element => {
    const { t } = useTranslation();

    const { props } = usePage();

    const { currentFilters, setChain, setSortBy } = useCollectionFilters({
        filters,
        filterRoute: route("collections"),
        options: {
            only: ["collections", "filters"],
            preserveScroll: true,
            preserveState: true,
        },
    });

    const [recentlyVotedCollection, setRecentlyVotedCollection] = useState<TemporalVotableCollection>();

    return (
        <DefaultLayout
            wrapperClassName="-mt-6 sm:-mt-8 lg:mt-0 -mb-6 sm:-mb-8 lg:mb-0"
            toastMessage={props.toast}
        >
            <Head title={title} />

            <FeaturedCollectionsCarousel featuredCollections={featuredCollections} />

            <div className="mx-6 mt-8 sm:mx-8 lg:mt-12 2xl:mx-0">
                <div className="flex items-center justify-between">
                    <Heading level={1}>{t("pages.collections.popular_collections")}</Heading>

                    <div className=" flex space-x-3 sm:relative md-lg:hidden">
                        <PopularCollectionsFilterPopover
                            sortBy={currentFilters.sort}
                            setSortBy={setSortBy}
                            chain={currentFilters.chain}
                            setChain={setChain}
                        />

                        <ViewAllButton
                            className="hidden sm:inline"
                            filters={currentFilters}
                        />
                    </div>
                </div>

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

                    <div>
                        <ViewAllButton filters={currentFilters} />
                    </div>
                </div>

                <div>
                    <div className="flex sm:space-x-2 md:space-x-3 md-lg:space-x-6">
                        <div className="flex-1">
                            <PopularCollectionsTable
                                collections={collections.slice(0, 6)}
                                user={auth.user}
                            />
                        </div>

                        <div className="hidden flex-1 sm:block">
                            <PopularCollectionsTable
                                collections={collections.slice(6, 12)}
                                user={auth.user}
                            />
                        </div>
                    </div>

                    <div className="mt-2 sm:hidden">
                        <ViewAllButton filters={currentFilters} />
                    </div>
                </div>
                <div
                    id="votes"
                    className="mt-12 flex w-full flex-col gap-4 xl:flex-row"
                >
                    <VoteCollections
                        collections={votableCollections}
                        votedCollection={votedCollection}
                        user={auth.user}
                    />

                    <CollectionOfTheMonthWinners
                        winners={collectionsOfTheMonth}
                        className="hidden xl:flex"
                    />
                </div>
            </div>

            <CollectionsArticles
                latest={latestArticles}
                popular={popularArticles}
            />

            <CollectionsCallToAction />

            {/* @TODO: remove this */}
            <div className="mt-2">
                <Button
                    onClick={() => {
                        setRecentlyVotedCollection({
                            name: "MoonBirds",
                            twitterUsername: "moonbirds",
                        });
                    }}
                >
                    Show Vote Modal
                </Button>

                <Button
                    onClick={() => {
                        setRecentlyVotedCollection({
                            name: "MoonBirds",
                            twitterUsername: null,
                        });
                    }}
                >
                    Show Vote Modal without twitter
                </Button>
            </div>

            <CollectionsVoteReceivedModal
                // @TODO: use a real collection
                collection={recentlyVotedCollection}
                onClose={() => {
                    setRecentlyVotedCollection(undefined);
                }}
            />
        </DefaultLayout>
    );
};

const ViewAllButton = ({ className, filters }: { className?: string; filters: Filters }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <ButtonLink
            variant="secondary"
            href={route("popular-collections", filters as RouteParams)}
            className={cn("w-full justify-center sm:w-auto", className)}
        >
            {t("common.view_all")}
        </ButtonLink>
    );
};

export default CollectionsIndex;
