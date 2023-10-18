import { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { ArticlesView, getArticlesInitialState } from "@/Pages/Articles/Components/ArticlesView";
import { useArticles } from "@/Pages/Articles/Hooks/useArticles";
import { articlesViewReducer } from "@/Pages/Articles/Hooks/useArticlesView";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

const ArticlesIndex = ({
    articles: initialArticles,
    highlightedArticles: initialHighlightedArticles,
}: {
    articles: App.Data.Articles.ArticlesData;
    highlightedArticles: App.Data.Articles.ArticleData[];
}): JSX.Element => {
    const { t } = useTranslation();

    const [articlesState, dispatch] = useReducer(articlesViewReducer, getArticlesInitialState());

    const { debouncedQuery, sort, pageLimit, isFilterDirty, displayType, page } = articlesState;

    const queryParameters = {
        search: debouncedQuery,
        sort,
        pageLimit: pageLimit.toString(),
        page: page.toString(),
    };

    useEffect(() => {
        replaceUrlQuery({
            ...queryParameters,
            view: displayType,
        });
    }, [debouncedQuery, sort, pageLimit, displayType, page]);

    const { articles, highlightedArticles, isLoading } = useArticles(queryParameters, isFilterDirty);

    const articlesToShow = isFilterDirty ? articles : initialArticles;

    return (
        <DefaultLayout>
            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <Heading
                    level={1}
                    className="pb-2 text-center dark:text-theme-dark-50 sm:text-left"
                >
                    {t("pages.articles.header_title", {
                        count: initialHighlightedArticles.length + initialArticles.paginated.meta.total,
                    })}
                </Heading>

                <ArticlesView
                    articles={articlesToShow}
                    highlightedArticles={isFilterDirty ? highlightedArticles : initialHighlightedArticles}
                    isLoading={isFilterDirty ? isLoading : false}
                    articlesState={articlesState}
                    dispatch={dispatch}
                    mode="articles"
                />
            </div>
        </DefaultLayout>
    );
};

export default ArticlesIndex;
