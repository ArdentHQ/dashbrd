import { ArticleCard } from "@/Components/Articles/ArticleCard";

export const ArticlesGrid = ({ articles }: { articles: App.Data.Articles.ArticleData[] }): JSX.Element => (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:grid-cols-3 xl:grid-cols-4">
        {articles.map((article) => (
            <ArticleCard
                key={article.id}
                article={article}
            />
        ))}
    </div>
);
