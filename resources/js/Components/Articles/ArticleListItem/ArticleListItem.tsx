import { useTranslation } from "react-i18next";
import { FeaturedCollections } from "@/Components/Articles/Article.blocks";
import { Img } from "@/Components/Image";
import { Link } from "@/Components/Link";
import { useAuth } from "@/Contexts/AuthContext";
import { type DateFormat } from "@/Types/enums";
import { formatTimestamp } from "@/Utils/dates";

export const ArticleListItem = ({ article }: { article: App.Data.Articles.ArticleData }): JSX.Element => {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <Link
            data-testid="ArticleListItem"
            href={route("articles.view", article.slug)}
            className="transition-default group flex space-x-3  bg-white p-6 ring-theme-primary-100 hover:ring dark:border-theme-dark-700 dark:bg-theme-dark-900 dark:hover:ring-theme-dark-500 lg:rounded-lg lg:border lg:border-theme-secondary-300 "
        >
            <div className="aspect-video h-11 flex-shrink-0 overflow-hidden rounded bg-theme-secondary-300 dark:bg-theme-dark-900 sm:h-16">
                <Img
                    className="h-full w-full overflow-hidden rounded object-cover"
                    wrapperClassName="h-full [&>span]:h-full"
                    alt={article.title}
                    srcSet={`${article.image.small} 1x, ${article.image.small2x} 2x`}
                    src={article.image.small}
                />
            </div>

            <div className="flex min-w-0 flex-1 flex-col space-y-2">
                <h4 className="transition-default line-clamp-2 break-words text-sm font-medium leading-[22px] text-theme-secondary-900 group-hover:text-theme-primary-700 dark:text-theme-dark-50 dark:group-hover:text-theme-primary-400 sm:line-clamp-1 sm:text-lg sm:leading-7">
                    {article.title}
                </h4>

                <div className="flex items-center space-x-3">
                    <div className="text-xs font-medium text-theme-secondary-700 dark:text-theme-dark-200 sm:text-sm">
                        {formatTimestamp(
                            article.publishedAt * 1000,
                            user?.attributes.date_format as DateFormat,
                            user?.attributes.timezone,
                        )}
                    </div>
                    <span className="block h-[5px] w-[5px] rounded-full bg-theme-secondary-400 dark:bg-theme-dark-500"></span>
                    <div className="flex flex-1 items-center">
                        <span className="mr-2 hidden shrink-0 text-sm font-medium text-theme-secondary-700 dark:text-theme-dark-200 sm:block">
                            {t("pages.articles.featured_collections")}:
                        </span>
                        <FeaturedCollections collections={article.featuredCollections} />
                    </div>
                </div>
            </div>
        </Link>
    );
};
