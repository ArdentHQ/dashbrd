import { ArticleListItem } from "@/Components/Articles/ArticleListItem";
import { ArticleListItemSkeleton } from "@/Components/Articles/ArticleListItem/ArticleListItemSkeleton";
import { range } from "@/utils/range";

export const ArticlesList = ({ articles }: { articles: App.Data.Articles.ArticleData[] }): JSX.Element => (
    <div className="w-full">
        <div className="-mx-6 space-y-1 bg-theme-secondary-100 dark:bg-theme-dark-700 sm:-mx-8 lg:mx-0 lg:space-y-2 lg:bg-transparent dark:lg:bg-transparent">
            {articles.map((article) => (
                <ArticleListItem
                    key={article.id}
                    article={article}
                />
            ))}
        </div>
    </div>
);

export const ArticlesLoadingList = ({ length = 24 }: { length?: number }): JSX.Element => (
    <div className="w-full">
        <div className="-mx-6 space-y-2 sm:-mx-8 lg:mx-0">
            {range(length).map((index) => (
                <ArticleListItemSkeleton key={index} />
            ))}
        </div>
    </div>
);
