import { ArticlesView } from "@/Pages/Articles/Components/ArticlesView";

interface ArticlesTabProperties {
    articles?: App.Data.Articles.ArticlesData;
    filters: Record<string, string>;
    setFilters: (filters: Record<string, string>) => void;
}

export const ArticlesTab = ({ articles, filters, setFilters }: ArticlesTabProperties): JSX.Element => (
    <ArticlesView
        articles={articles}
        isLoading={articles === undefined}
        setFilters={setFilters}
        mode="collection"
    />
);
