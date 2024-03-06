import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { ArticleCardSkeleton } from "@/Components/Articles/ArticleCard/ArticleCardSkeleton";
import { range } from "@/utils/range";

export const ArticlesGrid = ({ articles }: { articles: App.Data.Articles.ArticleData[] }): JSX.Element => (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md-lg:grid-cols-3 xl:grid-cols-4">
        {articles.map((article) => (
            <ArticleCard
                key={article.id}
                article={article}
            />
        ))}
    </div>
);

export const ArticlesLoadingGrid = ({ length = 24 }: { length?: number }): JSX.Element => (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md-lg:grid-cols-3 xl:grid-cols-4">
        {range(length).map((index) => (
            <ArticleCardSkeleton key={index} />
        ))}
    </div>
);
