import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { ArticleCardSkeleton } from "@/Components/Articles/ArticleCard/ArticleCardSkeleton";

export const ArticlesGrid = ({ articles }: { articles: App.Data.Articles.ArticleData[] }): JSX.Element => (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {articles.map((article) => (
            <ArticleCard
                key={article.id}
                article={article}
            />
        ))}
    </div>
);

export const ArticlesLoadingGrid = ({ length = 24 }: { length?: number }): JSX.Element => (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length }).map((_v, index) => (
            <ArticleCardSkeleton key={index} />
        ))}
    </div>
);
