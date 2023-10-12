import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DisplayType, DisplayTypes } from "@/Components/DisplayType";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { useDebounce } from "@/Hooks/useDebounce";
import { HighlightedArticles } from "@/Pages/Articles/Components/HighlightedArticles";
import { ArticlePagination } from "@/Pages/Collections/Components/Articles/ArticlePagination";
import { ArticlesGrid, ArticlesLoadingGrid } from "@/Pages/Collections/Components/Articles/ArticlesGrid";
import { ArticlesList, ArticlesLoadingList } from "@/Pages/Collections/Components/Articles/ArticlesList";
import { ArticleSortBy, ArticleSortDropdown } from "@/Pages/Collections/Components/Articles/ArticleSortDropdown";
import { getQueryParameters } from "@/Utils/get-query-parameters";
import { isTruthy } from "@/Utils/is-truthy";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

export const articlesViewDefaults = {
    sortBy: ArticleSortBy.latest,
    pageLimit: 24,
    debounce: 400,
    highlightedArticlesCount: 3,
};

export const ArticlesView = ({
    articles,
    isLoading: loadingArticles,
    setFilters,
    filters,
    mode,
}: {
    isLoading: boolean;
    articles?: App.Data.Articles.ArticlesData;
    setFilters: (filters: Record<string, string>) => void;
    filters: Record<string, string>;
    mode: "collection" | "articles";
}): JSX.Element => {
    const { t } = useTranslation();

    const { highlightedArticlesCount, debounce } = articlesViewDefaults;

    const [query, setQuery] = useState<string>(filters.search);
    const [debouncedQuery] = useDebounce(query, debounce);

    const [pageLimit, setPageLimit] = useState<number>(Number(filters.pageLimit));

    const [displayType, setDisplayType] = useState(filters.view as DisplayTypes);

    const [isFilterDirty, setFilterIsDirty] = useState(false);

    const isLoading = !loadingArticles && isFilterDirty ? true : loadingArticles;

    const [sortBy, setSortBy] = useState(filters.sort as ArticleSortBy);

    const [page, setPage] = useState<number>(Number(filters.page));

    useEffect(() => {
        const queryParameters: Record<string, string> = {
            pageLimit: pageLimit.toString(),
            sort: sortBy,
            search: debouncedQuery,
            view: displayType,
            page: page.toString(),
        };

        replaceUrlQuery(queryParameters);

        setFilters({
            ...queryParameters,
            isFilterDirty: isFilterDirty ? "yes" : "no",
        });

        setFilterIsDirty(false);
    }, [pageLimit, sortBy, debouncedQuery, page]);

    const articlesCount = articles?.paginated.meta.total ?? 0;
    const articlesLoaded = isTruthy(articles) && !isLoading;

    const showHighlighted = mode === "articles" && query === "" && page === 1;

    const articlesToShow = articlesLoaded
        ? articles.paginated.data.slice(showHighlighted ? highlightedArticlesCount : 0, articles.paginated.data.length)
        : [];

    return (
        <>
            <div className="mb-3 mt-6 flex items-center justify-between gap-x-3 sm:mb-4">
                <DisplayType
                    displayType={displayType}
                    onSelectDisplayType={(type) => {
                        replaceUrlQuery({ view: displayType });
                        setDisplayType(type);
                    }}
                />

                <div className="flex-1">
                    <SearchInput
                        disabled={articlesLoaded && articlesCount === 0 && query === ""}
                        className="hidden sm:block"
                        placeholder={t("pages.collections.articles.search_placeholder")}
                        query={query}
                        onChange={(query) => {
                            setQuery(query);
                            setFilterIsDirty(true);
                        }}
                    />
                </div>

                <ArticleSortDropdown
                    disabled={articlesLoaded && articlesCount === 0}
                    activeSort={sortBy}
                    onSort={(sort) => {
                        setSortBy(sort);
                        setFilterIsDirty(true);
                    }}
                />
            </div>
            <div className="mb-4 sm:hidden">
                <SearchInput
                    disabled={articlesLoaded && articlesCount === 0 && query === ""}
                    placeholder={t("pages.collections.articles.search_placeholder")}
                    query={query}
                    onChange={(query) => {
                        setQuery(query);
                        setFilterIsDirty(true);
                    }}
                />
            </div>

            {showHighlighted && (
                <HighlightedArticles
                    isLoading={isLoading}
                    hasEnoughArticles={(articles?.paginated.data.length ?? 0) > highlightedArticlesCount}
                    articles={articles?.paginated.data.slice(0, highlightedArticlesCount) ?? []}
                    withFullBorder={displayType === DisplayTypes.List}
                />
            )}

            <div className="flex flex-col items-center space-y-6">
                {articlesLoaded && displayType === DisplayTypes.Grid && <ArticlesGrid articles={articlesToShow} />}

                {articlesLoaded && displayType === DisplayTypes.List && <ArticlesList articles={articlesToShow} />}

                {isLoading && displayType === DisplayTypes.Grid && <ArticlesLoadingGrid />}

                {isLoading && displayType === DisplayTypes.List && <ArticlesLoadingList />}

                {!isLoading && articlesCount === 0 && query === "" && (
                    <EmptyBlock className="w-full">
                        {mode === "articles"
                            ? t("pages.articles.no_articles")
                            : t("pages.collections.articles.no_articles")}
                    </EmptyBlock>
                )}

                {!isLoading && articlesCount === 0 && query !== "" && (
                    <EmptyBlock className="w-full">
                        {t("pages.collections.articles.no_articles_with_filters")}
                    </EmptyBlock>
                )}

                {articlesLoaded && (
                    <ArticlePagination
                        pagination={articles.paginated}
                        onPageChange={(page: number) => {
                            setPage(page);
                            setFilterIsDirty(true);
                        }}
                        onPageLimitChange={(limit: number) => {
                            setPageLimit(limit);
                            setFilterIsDirty(true);
                        }}
                    />
                )}
            </div>
        </>
    );
};

export const getArticlesInitialState = (): Record<string, string> => {
    const { pageLimit: perPage, view, sort, search, page } = getQueryParameters();

    return {
        search: isTruthy(search) ? search : "",
        pageLimit: isTruthy(perPage) ? perPage : articlesViewDefaults.pageLimit.toString(),
        view: view === "list" ? DisplayTypes.List : DisplayTypes.Grid,
        sort: sort === "popularity" ? "popularity" : articlesViewDefaults.sortBy,
        page: isTruthy(page) ? page : "1",
    };
};
