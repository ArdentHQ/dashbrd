import { type PageProps } from "@inertiajs/core";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FeaturedCollectionsCarousel } from "./Components/FeaturedCollections";
import { PopularCollectionsSorting } from "./Components/PopularCollectionsSorting";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { PopularCollectionsTable } from "@/Components/Collections/PopularCollectionsTable";
import { Heading } from "@/Components/Heading";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { type ChainFilter, ChainFilters } from "@/Pages/Collections/Components/PopularCollectionsFilters";

interface CollectionsIndexProperties extends PageProps {
    activeSort: "top" | "floor-price";
    title: string;
    collections: PaginationData<App.Data.Collections.PopularCollectionData>;
    featuredCollections: App.Data.Collections.CollectionFeaturedData[];
    filters: {
        chain: ChainFilter | null;
    };
}

const CollectionsIndex = ({
    activeSort,
    title,
    featuredCollections,
    collections: { data: collections },
    auth,
    filters,
}: CollectionsIndexProperties): JSX.Element => {
    const { t } = useTranslation();

    const { props } = usePage();

    const [chain, setChain] = useState<ChainFilter | undefined>(filters.chain ?? undefined);

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        router.get(
            route("collections"),
            { chain },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }, [chain]);

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />
            <FeaturedCollectionsCarousel featuredCollections={featuredCollections} />
            <div className="mx-6 mt-8 sm:mx-8 lg:mt-12 2xl:mx-0">
                <div className="flex items-center justify-between">
                    <Heading level={1}>{t("pages.collections.popular_collections")}</Heading>

                    <div className="hidden sm:block lg:hidden">
                        <ViewAllButton />
                    </div>
                </div>

                <div className="mt-4 hidden items-center justify-between lg:flex">
                    <div className="flex space-x-3">
                        <PopularCollectionsSorting active={activeSort} />
                        <ChainFilters
                            chain={chain}
                            setChain={setChain}
                        />
                    </div>

                    <div>
                        <ViewAllButton />
                    </div>
                </div>

                <div>
                    <div className="flex sm:space-x-2 md:space-x-3 lg:space-x-6">
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
