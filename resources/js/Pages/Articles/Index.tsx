import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { ArticlesView, getArticlesInitialState } from "@/Pages/Articles/Components/ArticlesView";
import { useArticles } from "@/Pages/Articles/Hooks/useArticles";

const ArticlesIndex = ({
    articles: initialArticles,
    highlightedArticles: initialHighlightedArticles,
}: {
    articles: App.Data.Articles.ArticlesData;
    highlightedArticles: App.Data.Articles.ArticleData[];
}): JSX.Element => {
    const { t } = useTranslation();

    const [filters, setFilters] = useState<Record<string, string>>(() => getArticlesInitialState());

    const isFilterDirty = filters.isFilterDirty === "yes";

    const { articles, highlightedArticles, isLoading } = useArticles(filters, isFilterDirty);

    const articlesToShow = isFilterDirty ? articles : initialArticles;

    return (
        <DefaultLayout>
            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <Heading
                    level={1}
                    className="pb-2 text-center dark:text-theme-dark-50 sm:text-left"
                >
                    {t("pages.articles.header_title", {
                        count:
                            (articlesToShow?.paginated.meta.total ?? 0) +
                            (isFilterDirty ? highlightedArticles?.length ?? 0 : initialHighlightedArticles.length),
                    })}
                </Heading>

                <ArticlesView
                    articles={articlesToShow}
                    highlightedArticles={initialHighlightedArticles}
                    isLoading={isFilterDirty ? isLoading : false}
                    filters={filters}
                    setFilters={setFilters}
                    mode="articles"
                />
            </div>
        </DefaultLayout>
    );
};

export default ArticlesIndex;
