import { useState } from "react";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { ArticlesView } from "@/Pages/Articles/Components/ArticlesView";
import { useArticles } from "@/Pages/Articles/Hooks/useArticles";

const ArticlesIndex = ({ articles: initialArticles }: { articles: App.Data.Articles.ArticlesData }): JSX.Element => {
    const [filters, setFilters] = useState<Record<string, string>>({});

    const isFilterDirty = filters.isFilterDirty === "yes";

    const { articles, isLoading } = useArticles(filters, isFilterDirty);

    return (
        <DefaultLayout>
            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <ArticlesView
                    articles={isFilterDirty ? articles : initialArticles}
                    isLoading={isFilterDirty ? isLoading : false}
                    setFilters={setFilters}
                    mode="articles"
                />
            </div>
        </DefaultLayout>
    );
};

export default ArticlesIndex;
