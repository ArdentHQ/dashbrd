import { Head } from "@inertiajs/react";
import { useState } from "react";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { ArticlesView } from "@/Pages/Articles/Components/ArticlesView";
import { useArticles } from "@/Pages/Articles/Hooks/useArticles";

const ArticlesIndex = ({ articles: initialArticles }: { articles: App.Data.Articles.ArticlesData }): JSX.Element => {
    const [filters, setFilters] = useState<Record<string, string>>({});
    const { articles, isLoading } = useArticles(initialArticles, filters);

    return (
        <DefaultLayout>
            <Head title={"salam"} />
            <ArticlesView
                articles={articles}
                isLoading={isLoading}
                setFilters={setFilters}
            />
        </DefaultLayout>
    );
};

export default ArticlesIndex;
