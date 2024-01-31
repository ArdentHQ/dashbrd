import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { CollectionsArticles } from "./Components/CollectionsArticles";
import { CollectionsCallToAction } from "./Components/CollectionsCallToAction";
import { FeaturedCollectionsCarousel } from "./Components/FeaturedCollections";
import { PopularCollections } from "./PopularCollections";
import { CollectionOfTheMonthWinners } from "@/Components/Collections/CollectionOfTheMonthWinners";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { VoteCollections } from "@/Pages/Collections/Components/CollectionVoting";
import { type Filters } from "@/Pages/Collections/Hooks/useCollectionFilters";

interface CollectionsIndexProperties extends PageProps {
    title: string;
    featuredCollections: App.Data.Collections.CollectionFeaturedData[];
    collectionsOfTheMonth: App.Data.Collections.CollectionWinnersData;
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
    collectionsOfTheMonth,
    votableCollections,
    votedCollection,
    auth,
    filters,
    latestArticles,
    popularArticles,
}: CollectionsIndexProperties): JSX.Element => {
    const { props } = usePage();

    return (
        <DefaultLayout
            wrapperClassName="-mt-6 sm:-mt-8 lg:mt-0 -mb-6 sm:-mb-8 lg:mb-0"
            toastMessage={props.toast}
        >
            <Head title={title} />

            {featuredCollections.length > 0 && (
                <FeaturedCollectionsCarousel
                    className="mb-8 lg:mb-12"
                    featuredCollections={featuredCollections}
                />
            )}

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <PopularCollections
                    auth={auth}
                    filters={filters}
                />

                <div
                    id="votes"
                    className="mt-12 flex w-full flex-col rounded-xl border-theme-secondary-300 dark:border-theme-dark-700 lg:border xl:flex-row xl:gap-4 xl:border-0"
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

            {latestArticles.length > 0 && (
                <CollectionsArticles
                    latest={latestArticles}
                    popular={popularArticles}
                />
            )}

            <CollectionsCallToAction />
        </DefaultLayout>
    );
};

export default CollectionsIndex;
