import { type FormDataConvertible, type PageProps } from "@inertiajs/core";
import { Head, router, usePage } from "@inertiajs/react";
import cn from "classnames";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FeaturedCollectionsCarousel } from "./Components/FeaturedCollections";
import { PopularCollectionsFilterPopover } from "./Components/PopularCollectionsFilterPopover";
import { type PopularCollectionsSortBy, PopularCollectionsSorting } from "./Components/PopularCollectionsSorting";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { PopularCollectionsTable } from "@/Components/Collections/PopularCollectionsTable";
import { Heading } from "@/Components/Heading";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { CollectionOfTheMonth } from "@/Pages/Collections/Components/CollectionOfTheMonth";
import { type ChainFilter, ChainFilters } from "@/Pages/Collections/Components/PopularCollectionsFilters";

interface Filters extends Record<string, FormDataConvertible> {
    chain?: ChainFilter;
    sort?: PopularCollectionsSortBy;
}

interface CollectionsIndexProperties extends PageProps {
    title: string;
    collections: PaginationData<App.Data.Collections.PopularCollectionData>;
    featuredCollections: App.Data.Collections.CollectionFeaturedData[];
    topCollections: App.Data.Collections.CollectionOfTheMonthData[];
    filters: Filters;
}

const CollectionsIndex = ({
    title,
    featuredCollections,
    collections: { data: collections },
    topCollections,
    auth,
    filters,
}: CollectionsIndexProperties): JSX.Element => {
    const { t } = useTranslation();

    const { props } = usePage();

    const [currentFilters, setCurrentFilters] = useState<Filters>(filters);

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        router.get(route("collections"), currentFilters, {
            only: ["collections", "filters"],
            preserveScroll: true,
            preserveState: true,
        });
    }, [currentFilters]);

    const setChain = (chain: ChainFilter | undefined): void => {
        setCurrentFilters((filters) => ({
            ...filters,
            chain,
        }));
    };

    const setSortBy = (sort: PopularCollectionsSortBy | undefined): void => {
        setCurrentFilters((filters) => ({
            ...filters,
            sort,
        }));
    };

    return (
        <DefaultLayout toastMessage={props.toast}>
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

                        <ViewAllButton className="hidden sm:inline" />
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
                        <ViewAllButton />
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
                        <ViewAllButton />
                    </div>
                </div>
            </div>

            <CollectionOfTheMonth winners={topCollections} />
        </DefaultLayout>
    );
};

const ViewAllButton = ({ className }: { className?: string }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <ButtonLink
            variant="secondary"
            href="#"
            className={cn("w-full justify-center sm:w-auto", className)}
        >
            {t("common.view_all")}
        </ButtonLink>
    );
};

export default CollectionsIndex;
