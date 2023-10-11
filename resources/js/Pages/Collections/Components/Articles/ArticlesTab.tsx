import { useState } from "react";
import { ArticlesView, getArticlesInitialState } from "@/Pages/Articles/Components/ArticlesView";
import { useCollectionArticles } from "@/Pages/Collections/Hooks/useCollectionArticles";

export const ArticlesTab = ({ collection }: { collection: App.Data.Collections.CollectionDetailData }): JSX.Element => {
    const [filters, setFilters] = useState<Record<string, string>>(() => getArticlesInitialState());
    const { articles, isLoading } = useCollectionArticles(collection.slug, filters);

    return (
        <ArticlesView
            articles={articles}
            isLoading={isLoading}
            setFilters={setFilters}
            filters={filters}
            mode="collection"
        />
    );
};
