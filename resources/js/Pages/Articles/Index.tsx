import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { ArticlesView, getArticlesInitialState } from "@/Pages/Articles/Components/ArticlesView";
import { useArticles } from "@/Pages/Articles/Hooks/useArticles";

const ArticlesIndex = ({ articles: initialArticles }: { articles: App.Data.Articles.ArticlesData }): JSX.Element => {
    const { t } = useTranslation();

    const [filters, setFilters] = useState<Record<string, string>>(() => getArticlesInitialState());

    const isFilterDirty = filters.isFilterDirty === "yes";

    const { articles, isLoading } = useArticles(filters, isFilterDirty);

    return (
        <DefaultLayout>
            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <Heading
                    level={1}
                    className="pb-2 text-center dark:text-theme-dark-50 sm:text-left"
                >
                    {t("pages.articles.header_title", {
                        count: isLoading ? initialArticles.paginated.meta.total : articles?.paginated.meta.total ?? 0,
                    })}
                </Heading>
                <ArticlesView
                    articles={isFilterDirty ? articles : initialArticles}
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
