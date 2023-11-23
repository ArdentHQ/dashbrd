import { type PageProps } from "@inertiajs/core";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PopularCollectionsSorting } from "./Components/PopularCollectionsSorting";
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

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        router.get(
            route("collections"),
            { chain },
            {
                only: ["collections", "activeSort"],
                preserveScroll: true,
                preserveState: true,
            },
        );
    }, [chain]);

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <Heading level={1}>{t("pages.collections.popular_collections")}</Heading>

                <div className="mt-4 flex space-x-3">
                    <PopularCollectionsSorting active={activeSort} />
                    <ChainFilters
                        chain={chain}
                        setChain={setChain}
                    />
                </div>

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
            </div>
        </DefaultLayout>
    );
};

export default CollectionsIndex;
