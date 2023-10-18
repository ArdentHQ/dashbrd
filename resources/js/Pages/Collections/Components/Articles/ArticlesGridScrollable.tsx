import { ArticleCard } from "@/Components/Articles/ArticleCard";

export const ArticlesGridScrollable = ({ articles }: { articles: App.Data.Articles.ArticleData[] }): JSX.Element => (
    <div className="xl:-mx-1.5 xl:px-8 2xl:px-0">
        <div className=" flex max-w-full snap-x scroll-px-[26px] overflow-x-auto px-[26px]  xl:px-0">
            {articles.map((article) => (
                <div
                    key={article.id}
                    className="w-full flex-shrink-0 snap-start px-1.5 sm:w-1/2 md-lg:w-1/3 xl:w-1/4"
                >
                    <ArticleCard article={article} />
                </div>
            ))}
        </div>
    </div>
);
