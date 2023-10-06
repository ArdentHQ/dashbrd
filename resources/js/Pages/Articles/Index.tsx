import { Head } from "@inertiajs/react";
import { useState } from "react";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { ArticlesView } from "@/Pages/Articles/Components/ArticlesView";
import { useArticles } from "@/Pages/Articles/Hooks/useArticles";

const ArticlesIndex = ({ articles: initialArticles }: { articles: App.Data.Articles.ArticlesData }): JSX.Element => {
    const [filters, setFilters] = useState<Record<string, string | boolean>>({});

    const isFilterDirty = Boolean(filters.isFilterDirty);

    const { articles, isLoading } = useArticles(initialArticles, filters, isFilterDirty);

    return (
        <DefaultLayout>
            <Head title={"title"} />
            <ArticlesView
                articles={isFilterDirty ? articles : initialArticles}
                isLoading={isFilterDirty ? isLoading : false}
                setFilters={setFilters}
            />
        </DefaultLayout>
    );
};

export default ArticlesIndex;
