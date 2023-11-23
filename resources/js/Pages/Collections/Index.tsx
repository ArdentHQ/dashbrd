import { Head, usePage } from "@inertiajs/react";
import { FeaturedCollectionsCarousel } from "./Components/FeaturedCollections";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

const CollectionsIndex = ({
    title,
    featuredCollections,
}: {
    title: string;
    featuredCollections: App.Data.Collections.CollectionFeaturedData[];
}): JSX.Element => {
    const { props } = usePage();

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />
            <div>
                <FeaturedCollectionsCarousel featuredCollections={featuredCollections} />
            </div>
        </DefaultLayout>
    );
};

export default CollectionsIndex;
