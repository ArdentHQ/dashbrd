import { useTranslation } from "react-i18next";
import { FeaturedCollections } from "@/Components/Articles/ArticleCard/ArticleCard.blocks";
import { Img } from "@/Components/Image";

export const ArticleListItem = ({ article }: { article: App.Data.Articles.ArticleData }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <a
            data-testid="ArticleListItem"
            href={`/articles/${article.slug}`}
            className="flex space-x-3 border-b-4  border-theme-secondary-100 bg-white p-6 lg:rounded-lg lg:border lg:border-theme-secondary-300"
        >
            <div className="aspect-video h-11 flex-shrink-0 overflow-hidden rounded bg-theme-secondary-300 sm:h-16">
                <Img
                    className="h-full w-full overflow-hidden rounded object-cover"
                    wrapperClassName="h-full [&>span]:h-full"
                    alt={article.title}
                    src={article.image}
                />
            </div>

            <div className="flex flex-1 flex-col space-y-2">
                <h4 className="line-clamp-2 text-sm font-medium leading-[22px]  text-theme-secondary-900 sm:line-clamp-1 sm:text-lg sm:leading-7">
                    {article.title}
                </h4>

                <div className="flex items-center space-x-3">
                    <div className="text-xs font-medium text-theme-secondary-700 sm:text-sm">24 Oct 2023</div>
                    <span className="block h-[5px] w-[5px] rounded-full bg-theme-secondary-400"></span>
                    <div className="flex flex-1 items-center">
                        <span className="mr-2 hidden shrink-0 text-sm font-medium text-theme-secondary-700 sm:block">
                            {t("pages.articles.featured_collections")}:
                        </span>
                        <FeaturedCollections collections={article.featuredCollections} />
                    </div>
                </div>
            </div>
        </a>
    );
};
