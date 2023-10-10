import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { Heading } from "@/Components/Heading";
import { LayoutWrapper } from "@/Components/Layout/LayoutWrapper";
import { Pagination } from "@/Components/Pagination";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { useDebounce } from "@/Hooks/useDebounce";
import { useInertiaHeader } from "@/Hooks/useInertiaHeader";
import { GalleryGrid } from "@/Pages/Galleries/Components/GalleryGrid";
import { GalleryListbox } from "@/Pages/Galleries/Components/GalleryListbox";
import { GallerySkeletonItem } from "@/Pages/Galleries/Components/GallerySkeleton";
import { isTruthy } from "@/Utils/is-truthy";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

const debounceTimeout = 400;

export const GalleryPage = ({
    selectedOption,
    title,
}: {
    title: string;
    selectedOption: { value?: string; label?: string };
}): JSX.Element => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);

    const searchParameters = new URLSearchParams(window.location.search);

    const currentPage = searchParameters.get("page") ?? 1;
    const initialQuery = searchParameters.get("query") ?? "";

    const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

    const [galleries, setGalleries] = useState<PaginationData<App.Data.Gallery.GalleryData>>();

    const [debouncedQuery] = useDebounce(searchQuery, debounceTimeout);

    const { headers } = useInertiaHeader();

    const fetchGalleries = async (): Promise<void> => {
        const pageUrlWithSearch = replaceUrlQuery({
            query: debouncedQuery,
            page: (debouncedQuery !== initialQuery ? 1 : currentPage).toString(),
        });

        setLoading(true);

        const { data } = await axios.get<{
            paginated: PaginationData<App.Data.Gallery.GalleryData>;
        }>(pageUrlWithSearch, {
            requestId: "gallery-page",
            headers,
        });

        // If the user is on a page that doesn't exist anymore, redirect them to the last page
        if (data.paginated.meta.current_page > data.paginated.meta.last_page) {
            router.replace(data.paginated.meta.last_page_url, {
                preserveState: false,
            });
            return;
        }

        setGalleries(data.paginated);
        setLoading(false);
    };

    useEffect(() => {
        void fetchGalleries();
    }, [debouncedQuery]);

    return (
        <LayoutWrapper
            useVerticalOffset={false}
            className="py-0 lg:py-6"
        >
            <Head title={title} />

            <div>
                <div className="mx-0 mb-4 lg:mx-8 2xl:mx-0">
                    <div className="items-center gap-x-2 bg-theme-secondary-100 px-6 py-4 dark:bg-theme-dark-800 sm:px-8 lg:flex lg:bg-transparent lg:p-0 dark:lg:bg-transparent">
                        <div className="hidden lg:block">
                            <Heading level={1}>{t("pages.galleries.title")}:</Heading>
                        </div>
                        <GalleryListbox
                            selectedOption={selectedOption}
                            searchQuery={searchQuery}
                        />
                    </div>

                    <SearchInput
                        className="mx-6 mt-6 sm:mx-8 lg:mx-0"
                        placeholder={t("pages.galleries.search.placeholder")}
                        query={searchQuery}
                        onChange={setSearchQuery}
                    />
                </div>

                <div className="mx-6 sm:mx-8 2xl:mx-0">
                    {loading && (
                        <div className="-m-1 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 12 }).map((_, index) => (
                                <GallerySkeletonItem
                                    className="m-1"
                                    key={index}
                                />
                            ))}
                        </div>
                    )}

                    {!loading && galleries?.meta.total === 0 && (
                        <>
                            {debouncedQuery !== "" ? (
                                <EmptyBlock>{t("pages.galleries.search.no_results")}</EmptyBlock>
                            ) : (
                                <EmptyBlock>{t("pages.galleries.empty_title")}</EmptyBlock>
                            )}
                        </>
                    )}

                    {!loading && isTruthy(galleries) && galleries.meta.total > 0 && (
                        <GalleryGrid galleries={galleries.data} />
                    )}
                </div>

                {!loading && isTruthy(galleries) && galleries.meta.last_page > 1 && (
                    <Pagination
                        className="my-3 flex w-full flex-col justify-center px-6 xs:items-center  sm:px-8"
                        data={galleries}
                    />
                )}
            </div>
        </LayoutWrapper>
    );
};
