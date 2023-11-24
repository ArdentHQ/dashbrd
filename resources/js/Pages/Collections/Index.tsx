import { type PageProps } from "@inertiajs/core";
import { Head, router, usePage } from "@inertiajs/react";
import cn from "classnames";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PopularCollectionsFilterPopover } from "./Components/PopularCollectionsFilterPopover";
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
    filters: {
        chain: ChainFilter | null;
    };
}

const CollectionsIndex = ({
    activeSort,
    title,
    collections: { data: collections },
    auth,
    filters,
}: CollectionsIndexProperties): JSX.Element => {
    const { t } = useTranslation();

    const { props } = usePage();

    const [chain, setChain] = useState<ChainFilter | undefined>(filters.chain ?? undefined);

    const [sortBy, setSortBy] = useState<"top" | "floor-price">(activeSort);

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        router.get(
            route("collections"),
            {
                chain,
                sort: sortBy === "floor-price" ? sortBy : undefined,
            },
            {
                only: ["collections", "activeSort", "filters"],
                preserveScroll: true,
                preserveState: true,
            },
        );
    }, [chain, sortBy]);

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <div className="flex items-center justify-between">
                    <Heading level={1}>{t("pages.collections.popular_collections")}</Heading>

                    <div className=" flex space-x-3 sm:relative md-lg:hidden">
                        <PopularCollectionsFilterPopover
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                        />

                        <ViewAllButton className="hidden sm:inline" />
                    </div>
                </div>

                <div className="mt-4 hidden items-center justify-between md-lg:flex">
                    <div className="flex space-x-3">
                        <PopularCollectionsSorting
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                        />

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
