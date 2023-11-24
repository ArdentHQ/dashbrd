import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { PopularCollectionsSorting } from "./Components/PopularCollectionsSorting";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
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
                <div className="flex items-center justify-between">
                    <Heading level={1}>{t("pages.collections.popular_collections")}</Heading>

                    <div className="hidden sm:block lg:hidden">
                        <ViewAllButton />
                    </div>
                </div>

                <div className="mt-4 hidden items-center justify-between lg:flex">
                    <div>
                        <PopularCollectionsSorting active={activeSort} />
                    </div>

                    <div>
                        <ViewAllButton />
                    </div>
                </div>

                <div>
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

                    <div className="mt-2 sm:hidden">
                        <ViewAllButton />
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

const ViewAllButton = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <ButtonLink
            variant="secondary"
            href="#"
            className="w-full justify-center sm:w-auto"
        >
            {t("common.view_all")}
        </ButtonLink>
    );
};

export default CollectionsIndex;
