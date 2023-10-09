import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DisplayType, DisplayTypes } from "@/Components/DisplayType";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { useDebounce } from "@/Hooks/useDebounce";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";
import { LatestArticles } from "@/Pages/Articles/Components/LatestArticles";
import { ArticlePagination } from "@/Pages/Collections/Components/Articles/ArticlePagination";
import { ArticlesGrid, ArticlesLoadingGrid } from "@/Pages/Collections/Components/Articles/ArticlesGrid";
import { ArticlesList, ArticlesLoadingList } from "@/Pages/Collections/Components/Articles/ArticlesList";
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
    mode,
}: {
    isLoading: boolean;
    articles?: App.Data.Articles.ArticlesData;
    setFilters: (filters: Record<string, string>) => void;
    mode: "collection" | "articles";
}): JSX.Element => {
    const { t } = useTranslation();

    const { pageLimit: perPage, view, sort, search, page } = getQueryParameters();

    const [query, setQuery] = useState<string>(isTruthy(search) ? search : "");
    const [debouncedQuery] = useDebounce(query, defaults.debounce);

    const [pageLimit, setPageLimit] = useState<number>(isTruthy(perPage) ? Number(perPage) : defaults.pageLimit);

    const [displayType, setDisplayType] = useState(view === "list" ? DisplayTypes.List : DisplayTypes.Grid);

    const [sortBy, setSortBy] = useState<ArticleSortBy>(
        (sort === "popularity" ? "popularity" : defaults.sortBy) as ArticleSortBy,
    );

    const isFirstRender = useIsFirstRender();

    const queryParameters: Record<string, string> = {
        pageLimit: pageLimit.toString(),
        sort: sortBy,
        search: debouncedQuery,
        view: displayType,
    };

    useEffect(() => {
        replaceUrlQuery(queryParameters);

        setFilters({
            ...queryParameters,
            isFilterDirty: isFirstRender ? "no" : "yes",
        });
    }, [pageLimit, sortBy, debouncedQuery, displayType]);

    const articlesCount = articles?.paginated.meta.total ?? 0;
    const articlesLoaded = isTruthy(articles);

    const currentPage = isTruthy(page) ? Number(page) : 1;
    const showLatestArticlesCards =
        mode === "articles" && query === "" && currentPage === 1 && (isLoading || articlesLoaded);

    const articlesToShow = articlesLoaded
        ? articles.paginated.data.slice(showLatestArticlesCards ? 3 : 0, articles.paginated.data.length)
        : [];

    return (
        <>
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
                    disabled={!articlesLoaded}
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

            {showLatestArticlesCards && (
                <LatestArticles
                    isLoading={isLoading}
                    hasEnoughArticles={(articles?.paginated.data.length ?? 0) > 3}
                    articles={articles?.paginated.data.slice(0, 3) ?? []}
                    withFullBorder={displayType === DisplayTypes.List}
                />
            )}

            <div className="flex flex-col items-center space-y-6">
                {articlesLoaded && displayType === DisplayTypes.Grid && <ArticlesGrid articles={articlesToShow} />}

                {articlesLoaded && displayType === DisplayTypes.List && <ArticlesList articles={articlesToShow} />}

                {isLoading && displayType === DisplayTypes.Grid && <ArticlesLoadingGrid />}

                {isLoading && displayType === DisplayTypes.List && <ArticlesLoadingList />}

                {!isLoading && articlesCount === 0 && query === "" && (
                    <EmptyBlock className="w-full">{t("pages.collections.articles.no_articles")}</EmptyBlock>
                )}

                {!isLoading && articlesCount === 0 && query !== "" && (
                    <EmptyBlock className="w-full">
                        {t("pages.collections.articles.no_articles_with_filters")}
                    </EmptyBlock>
                )}

                {articlesLoaded && (
                    <ArticlePagination
                        pagination={articles.paginated}
                        onPageLimitChange={(limit: number) => {
                            setPageLimit(limit);
                        }}
                    />
                )}
            </div>
        </>
    );
};
