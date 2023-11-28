import { type Dispatch, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DisplayType, DisplayTypes } from "@/Components/DisplayType";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { useDebounce } from "@/Hooks/useDebounce";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";
import { HighlightedArticles } from "@/Pages/Articles/Components/HighlightedArticles";
import {
    type ArticlesViewActions,
    ArticlesViewActionTypes,
    type ArticlesViewState,
} from "@/Pages/Articles/Hooks/useArticlesView";
import { ArticlePagination } from "@/Pages/Collections/Components/Articles/ArticlePagination";
import { ArticlesGrid, ArticlesLoadingGrid } from "@/Pages/Collections/Components/Articles/ArticlesGrid";
import { ArticlesList, ArticlesLoadingList } from "@/Pages/Collections/Components/Articles/ArticlesList";
import { ArticleSortBy, ArticleSortDropdown } from "@/Pages/Collections/Components/Articles/ArticleSortDropdown";
import { getQueryParameters } from "@/Utils/get-query-parameters";
import { isTruthy } from "@/Utils/is-truthy";
import { scrollToTop } from "@/Utils/scroll-to-top";

export const articlesViewDefaults = {
    pageLimit: 24,
    debounce: 400,
    highlightedArticlesCount: 3,
};

export const ArticlesView = ({
    articles,
    highlightedArticles = [],
    isLoading,
    articlesState,
    dispatch,
    mode,
}: {
    isLoading: boolean;
    highlightedArticles?: App.Data.Articles.ArticleData[];
    articles?: App.Data.Articles.ArticlesData;
    articlesState: ArticlesViewState;
    dispatch: Dispatch<ArticlesViewActions>;
    mode: "collection" | "articles";
}): JSX.Element => {
    const { t } = useTranslation();

    const { displayType, sort, debouncedQuery, page } = articlesState;

    const [query, setQuery] = useState(debouncedQuery);

    const [debouncedValue] = useDebounce(query, articlesViewDefaults.debounce);
    const [forceShowHighlighted, setForceShowHighlighted] = useState(false);

    const isFistRender = useIsFirstRender();

    useEffect(() => {
        if (isFistRender) return;

        dispatch({ type: ArticlesViewActionTypes.SetDebouncedQuery, payload: query });
        setForceShowHighlighted(false);
    }, [debouncedValue]);

    const articlesTotal = articles?.paginated.meta.total;
    const articlesLoaded = isTruthy(articles) && !isLoading;

    const showHighlighted = forceShowHighlighted || (mode === "articles" && query === "" && page === 1);
    const articlesToShow = articlesLoaded ? articles.paginated.data : [];

    const handleQueryChange = (query: string): void => {
        // if highlighted articles are visible keep it visible when
        // search query changes, otherwise the page will jump
        if (showHighlighted) {
            setForceShowHighlighted(true);
        }

        setQuery(query);

        if (query === "") {
            dispatch({ type: ArticlesViewActionTypes.SetDebouncedQuery, payload: query });
        }
    };

    return (
        <>
            <div className="mb-3 mt-6 flex items-center justify-between gap-x-3 sm:mb-4">
                <DisplayType
                    displayType={displayType}
                    onSelectDisplayType={(type) => {
                        dispatch({ type: ArticlesViewActionTypes.SetDisplayType, payload: type });
                    }}
                />

                <div className="flex-1">
                    <SearchInput
                        disabled={articlesLoaded && articlesTotal === 0 && query === ""}
                        className="hidden sm:block"
                        placeholder={t("pages.collections.articles.search_placeholder")}
                        query={query}
                        onChange={handleQueryChange}
                    />
                </div>

                <ArticleSortDropdown
                    disabled={articlesLoaded && articlesTotal === 0}
                    activeSort={sort}
                    onSort={(sort) => {
                        dispatch({ type: ArticlesViewActionTypes.SetSort, payload: sort });
                    }}
                />
            </div>
            <div className="mb-4 sm:hidden">
                <SearchInput
                    disabled={articlesLoaded && articlesTotal === 0 && query === ""}
                    placeholder={t("pages.collections.articles.search_placeholder")}
                    query={query}
                    onChange={handleQueryChange}
                />
            </div>

            {showHighlighted && (
                <HighlightedArticles
                    isLoading={isLoading}
                    articles={highlightedArticles}
                    withFullBorder={displayType === DisplayTypes.List}
                />
            )}

            <div className="flex flex-col items-center space-y-6">
                {articlesLoaded && displayType === DisplayTypes.Grid && <ArticlesGrid articles={articlesToShow} />}

                {articlesLoaded && displayType === DisplayTypes.List && <ArticlesList articles={articlesToShow} />}

                {isLoading && displayType === DisplayTypes.Grid && <ArticlesLoadingGrid />}

                {isLoading && displayType === DisplayTypes.List && <ArticlesLoadingList />}

                {!isLoading && articlesToShow.length === 0 && highlightedArticles?.length === 0 && query === "" && (
                    <EmptyBlock className="w-full">
                        {mode === "articles"
                            ? t("pages.articles.no_articles")
                            : t("pages.collections.articles.no_articles")}
                    </EmptyBlock>
                )}

                {!isLoading && articlesToShow.length === 0 && highlightedArticles?.length === 0 && query !== "" && (
                    <EmptyBlock className="w-full">
                        {t("pages.collections.articles.no_articles_with_filters")}
                    </EmptyBlock>
                )}

                {articlesLoaded && (
                    <ArticlePagination
                        pagination={articles.paginated}
                        onPageChange={(page) => {
                            scrollToTop();
                            dispatch({ type: ArticlesViewActionTypes.SetPage, payload: page });
                        }}
                        onPageLimitChange={(limit: number) => {
                            scrollToTop();
                            dispatch({ type: ArticlesViewActionTypes.SetPageLimit, payload: limit });
                        }}
                    />
                )}
            </div>
        </>
    );
};

export const getArticlesInitialState = (): ArticlesViewState => {
    const { pageLimit: perPage, view, sort, search, page } = getQueryParameters();

    return {
        debouncedQuery: isTruthy(search) ? search : "",
        pageLimit: isTruthy(perPage) ? Number(perPage) : articlesViewDefaults.pageLimit,
        displayType: view === "list" ? DisplayTypes.List : DisplayTypes.Grid,
        sort: sort === "popularity" ? ArticleSortBy.popularity : ArticleSortBy.latest,
        page: isTruthy(page) ? Number(page) : 1,
        isFilterDirty: false,
    };
};
