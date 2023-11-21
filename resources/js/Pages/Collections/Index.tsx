import { Head, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

const CollectionsIndex = ({
    title,
    collections: { data: collections },
}: {
    title: string;
    collections: PaginationData<App.Data.Collections.PopularCollectionData>;
}): JSX.Element => {
    const { t } = useTranslation();

    const { props } = usePage();

    const collectionsColumn1: App.Data.Collections.PopularCollectionData[] = collections.slice(0, 6);

    const collectionsColumn2: App.Data.Collections.PopularCollectionData[] = collections.slice(6, 12);

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <Heading level={1}>{t("pages.collections.popular_collections")}</Heading>
            </div>
        </DefaultLayout>
    );
};

export default CollectionsIndex;
