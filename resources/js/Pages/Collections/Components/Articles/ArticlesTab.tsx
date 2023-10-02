import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DisplayType, DisplayTypes } from "@/Components/DisplayType";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { useCollectionArticles } from "@/Hooks/useCollectionArticles";
import { ArticlePagination } from "@/Pages/Collections/Components/Articles/ArticlePagination";
import { ArticlesGrid } from "@/Pages/Collections/Components/Articles/ArticlesGrid";
import { ArticlesList } from "@/Pages/Collections/Components/Articles/ArticlesList";
import { ArticleSortDropdown } from "@/Pages/Collections/Components/Articles/ArticleSortDropdown";
import { getQueryParameters } from "@/Utils/get-query-parameters";
import { isTruthy } from "@/Utils/is-truthy";

export const ArticlesTab = ({ collection }: { collection: App.Data.Collections.CollectionDetailData }): JSX.Element => {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");

    const { articles, isLoading } = useCollectionArticles(collection.slug);
    console.log(articles);

    const queryParameters = getQueryParameters();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [pageLimit, setPageLimit] = useState<number>(24);

    const [displayType, setDisplayType] = useState(
        queryParameters.view === "list" ? DisplayTypes.List : DisplayTypes.Grid,
    );

    if (isLoading || !isTruthy(articles)) {
        return <>is loading</>;
    }

    // replace this with articles count
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
                    activeSort={"latest"}
                    onSort={() => 1}
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
                    <EmptyBlock>{t("pages.collections.articles.no_articles")}</EmptyBlock>
                )}
                {articlesCount === 0 && query !== "" && (
                    <EmptyBlock>{t("pages.collections.articles.no_articles_with_filters")}</EmptyBlock>
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
