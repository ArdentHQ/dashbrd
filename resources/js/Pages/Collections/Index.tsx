import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { PopularCollectionsSorting } from "./Components/PopularCollectionsSorting";
import { PopularCollectionsTable } from "@/Components/Collections/PopularCollectionsTable";
import { Heading } from "@/Components/Heading";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

interface CollectionsIndexProperties extends PageProps {
    activeSort: "top" | "floor-price";
    title: string;
    collections: PaginationData<App.Data.Collections.PopularCollectionData>;
}

const CollectionsIndex = ({
    activeSort,
    title,
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

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <Heading level={1}>{t("pages.collections.popular_collections")}</Heading>

                <div className="mt-4">
                    <PopularCollectionsSorting active={activeSort} />
                </div>

                <div className="flex space-x-6">
                    <PopularCollectionsTable
                        collections={collectionsColumn1}
                        user={auth.user}
                    />

                    <PopularCollectionsTable
                        collections={collectionsColumn2}
                        user={auth.user}
                    />
                </div>
            </div>
        </DefaultLayout>
    );
};

export default CollectionsIndex;
