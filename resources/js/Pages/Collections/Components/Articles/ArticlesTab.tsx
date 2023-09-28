import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DisplayType, DisplayTypes } from "@/Components/DisplayType";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { ArticlePagination } from "@/Pages/Collections/Components/Articles/ArticlePagination";
import { ArticlesGrid } from "@/Pages/Collections/Components/Articles/ArticlesGrid";
import { ArticlesList } from "@/Pages/Collections/Components/Articles/ArticlesList";
import { ArticleSortDropdown } from "@/Pages/Collections/Components/Articles/ArticleSortDropdown";
import { SamplePageMeta } from "@/Tests/SampleData";
import { getQueryParameters } from "@/Utils/get-query-parameters";

export const ArticlesTab = (): JSX.Element => {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");

    const queryParameters = getQueryParameters();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [pageLimit, setPageLimit] = useState<number>(24);

    const [displayType, setDisplayType] = useState(
        queryParameters.view === "list" ? DisplayTypes.List : DisplayTypes.Grid,
    );

    // replace this with articles count
    const articlesCount = Math.random() * 10;

    return (
        <div>
            <div className="mb-3 mt-6 flex items-center justify-between gap-x-3 sm:mb-4">
                <DisplayType
                    displayType={displayType}
                    onSelectDisplayType={(type) => {
                        setDisplayType(type);
                    }}
                />

                <div className="flex-1">
                    <SearchInput
                        className="hidden sm:block"
                        placeholder={"Search in Articles"}
                        query={query}
                        onChange={(query) => {
                            setQuery(query);
                        }}
                    />
                </div>

                <ArticleSortDropdown
                    activeSort={"id"}
                    onSort={() => 1}
                />
            </div>
            <div className="mb-4 sm:hidden">
                <SearchInput
                    placeholder={"Search in Articles"}
                    query={query}
                    onChange={(query) => {
                        setQuery(query);
                    }}
                />
            </div>

            {articlesCount > 0 && displayType === DisplayTypes.Grid && <ArticlesGrid />}

            {articlesCount > 0 && displayType === DisplayTypes.List && <ArticlesList />}

            {articlesCount === 0 && query === "" && (
                <div className="mt-6">
                    <EmptyBlock>{t("pages.collections.articles.no_articles")}</EmptyBlock>
                </div>
            )}
            {articlesCount === 0 && query !== "" && (
                <div className="mt-6">
                    <EmptyBlock>{t("pages.collections.articles.no_articles_with_filters")}</EmptyBlock>
                </div>
            )}
            <ArticlePagination
                pagination={SamplePageMeta.paginated as PaginationData<unknown>}
                onPageLimitChange={(limit: number) => {
                    setPageLimit(limit);
                }}
            />
        </div>
    );
};
