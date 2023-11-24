import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { FeaturedCollectionsCarousel } from "./Components/FeaturedCollections";
import { PopularCollectionsTable } from "@/Components/Collections/PopularCollectionsTable";
import { Heading } from "@/Components/Heading";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

interface CollectionsIndexProperties extends PageProps {
    title: string;
    collections: PaginationData<App.Data.Collections.PopularCollectionData>;
    featuredCollections: App.Data.Collections.CollectionFeaturedData[];
}

const CollectionsIndex = ({
    title,
    featuredCollections,
    collections: { data: collections },
    auth,
}: CollectionsIndexProperties): JSX.Element => {
    const { t } = useTranslation();

    const { props } = usePage();

    const collectionsColumn1: App.Data.Collections.PopularCollectionData[] = collections.slice(0, 6);

    const collectionsColumn2: App.Data.Collections.PopularCollectionData[] = collections.slice(6, 12);

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />
            <FeaturedCollectionsCarousel featuredCollections={featuredCollections} />
            <div className="mx-6 mt-8 sm:mx-8 lg:mt-12 2xl:mx-0">
                <Heading level={1}>{t("pages.collections.popular_collections")}</Heading>

                <div className="flex sm:space-x-2 md:space-x-3 lg:space-x-6">
                    <div className="flex-1">
                        <PopularCollectionsTable
                            collections={collectionsColumn1}
                            user={auth.user}
                        />
                    </div>

                    <div className="hidden flex-1 sm:block">
                        <PopularCollectionsTable
                            collections={collectionsColumn2}
                            user={auth.user}
                        />
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default CollectionsIndex;
