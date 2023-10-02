import { ArticleListItem } from "@/Components/Articles/ArticleListItem";

export const ArticlesList = ({ articles }: { articles: App.Data.Articles.ArticleData[] }): JSX.Element => (
    <div className="-mx-6 w-full space-y-2 sm:-mx-8 lg:mx-0">
        {articles.map((article) => (
            <ArticleListItem
                key={article.id}
                article={article}
            />
        ))}
    </div>
);
