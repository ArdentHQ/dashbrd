import { Head } from "@inertiajs/react";
import { useState } from "react";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { ArticlesView } from "@/Pages/Articles/Components/ArticlesView";
import { useArticles } from "@/Pages/Articles/Hooks/useArticles";

const ArticlesIndex = ({ articles: initialArticles }: { articles: App.Data.Articles.ArticlesData }): JSX.Element => {
    const [filters, setFilters] = useState<Record<string, string>>({});

    const initialRender = Object.keys(filters).length === 0;

    const { articles, isLoading } = useArticles(initialArticles, filters, !initialRender);

    return (
        <DefaultLayout>
            <Head title={"haha"} />
            <ArticlesView
                articles={initialRender ? initialArticles : articles}
                isLoading={initialRender ? false : isLoading}
                setFilters={setFilters}
            />
        </DefaultLayout>
    );
};

export default ArticlesIndex;
