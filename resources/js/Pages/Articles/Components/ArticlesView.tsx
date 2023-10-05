import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DisplayType, DisplayTypes } from "@/Components/DisplayType";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { useDebounce } from "@/Hooks/useDebounce";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";
import { ArticlePagination } from "@/Pages/Collections/Components/Articles/ArticlePagination";
import { ArticlesGrid } from "@/Pages/Collections/Components/Articles/ArticlesGrid";
import { ArticlesList } from "@/Pages/Collections/Components/Articles/ArticlesList";
import { ArticleSortBy, ArticleSortDropdown } from "@/Pages/Collections/Components/Articles/ArticleSortDropdown";
import { getQueryParameters } from "@/Utils/get-query-parameters";
import { isTruthy } from "@/Utils/is-truthy";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

const defaults = {
    sortBy: ArticleSortBy.latest,
    pageLimit: 24,
    debounce: 400,
};

export const ArticlesView = ({
    articles,
    isLoading,
    setFilters,
}: {
    isLoading: boolean;
    articles?: App.Data.Articles.ArticlesData;
    setFilters: (filters: Record<string, string>) => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const { pageLimit: perPage, view, sort, search } = getQueryParameters();

    const [query, setQuery] = useState<string>(isTruthy(search) ? search : "");
    const [debouncedQuery] = useDebounce(query, defaults.debounce);

    const [pageLimit, setPageLimit] = useState<number>(isTruthy(perPage) ? Number(perPage) : defaults.pageLimit);

    const [displayType, setDisplayType] = useState(view === "list" ? DisplayTypes.List : DisplayTypes.Grid);

    const [sortBy, setSortBy] = useState<ArticleSortBy>(
        (sort in ArticleSortBy ? sort : defaults.sortBy) as ArticleSortBy,
    );

    const queryParameters: Record<string, string> = {
        pageLimit: pageLimit.toString(),
        sort: sortBy,
        search: debouncedQuery,
        view: displayType,
    };

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        replaceUrlQuery(queryParameters);

        if (!isFirstRender) {
            setFilters(queryParameters);
        }
    }, [JSON.stringify(queryParameters)]);

    if (isLoading || !isTruthy(articles)) {
        return <>is loading</>;
    }

    const articlesCount = articles.paginated.meta.total;

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
                        placeholder={t("pages.collections.articles.search_placeholder")}
                        query={query}
                        onChange={(query) => {
                            setQuery(query);
                        }}
                    />
                </div>

                <ArticleSortDropdown
                    activeSort={sortBy}
                    onSort={(sort) => {
                        setSortBy(sort);
                    }}
                />
            </div>
            <div className="mb-4 sm:hidden">
                <SearchInput
                    placeholder={t("pages.collections.articles.search_placeholder")}
                    query={query}
                    onChange={(query) => {
                        setQuery(query);
                    }}
                />
            </div>

            <div className="flex flex-col items-center space-y-6">
                {articlesCount > 0 && displayType === DisplayTypes.Grid && (
                    <ArticlesGrid articles={articles.paginated.data} />
                )}

                {articlesCount > 0 && displayType === DisplayTypes.List && (
                    <ArticlesList articles={articles.paginated.data} />
                )}

                {articlesCount === 0 && query === "" && (
                    <EmptyBlock className="w-full">{t("pages.collections.articles.no_articles")}</EmptyBlock>
                )}
                {articlesCount === 0 && query !== "" && (
                    <EmptyBlock className="w-full">
                        {t("pages.collections.articles.no_articles_with_filters")}
                    </EmptyBlock>
                )}

                <ArticlePagination
                    pagination={articles.paginated}
                    onPageLimitChange={(limit: number) => {
                        setPageLimit(limit);
                    }}
                />
            </div>
        </div>
    );
};
