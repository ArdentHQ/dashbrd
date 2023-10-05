import { Head } from "@inertiajs/react";
import { useState } from "react";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { ArticlesView } from "@/Pages/Articles/Components/ArticlesView";
import { useArticles } from "@/Pages/Articles/Hooks/useArticles";

const ArticlesIndex = ({ articles: initialArticles }: { articles: App.Data.Articles.ArticlesData }): JSX.Element => {
    const [filters, setFilters] = useState<Record<string, string>>({});

    const isFilterDirty = Object.keys(filters).length === 0;

    const { articles, isLoading } = useArticles(initialArticles, filters, !isFilterDirty);

    return (
        <DefaultLayout>
            <Head title={"haha"} />
            <ArticlesView
                articles={isFilterDirty ? initialArticles : articles}
                isLoading={isFilterDirty ? false : isLoading}
                setFilters={setFilters}
            />
        </DefaultLayout>
    );
};

export default ArticlesIndex;
