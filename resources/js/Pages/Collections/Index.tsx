import { Head, usePage } from "@inertiajs/react";
import { FeaturedCollectionsSlider } from "./Components/FeaturedCollections";
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
                <FeaturedCollectionsSlider featuredCollections={featuredCollections} />
            </div>
        </DefaultLayout>
    );
};

export default CollectionsIndex;
