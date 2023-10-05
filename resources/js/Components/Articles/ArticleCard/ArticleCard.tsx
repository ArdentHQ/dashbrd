import { useTranslation } from "react-i18next";
import { FeaturedCollections } from "@/Components/Articles/Article.blocks";
import { Img } from "@/Components/Image";
import { useActiveUser } from "@/Contexts/ActiveUserContext";
import { type DateFormat } from "@/Types/enums";
import { formatTimestamp } from "@/Utils/dates";

export const ArticleCard = ({ article }: { article: App.Data.Articles.ArticleData }): JSX.Element => {
    const { t } = useTranslation();
    const { user } = useActiveUser();

    return (
        <a
            data-testid="ArticleCard"
            href={`/articles/${article.slug}`}
            className="group flex w-full flex-col overflow-hidden rounded-xl border border-theme-secondary-300 bg-white"
        >
            <div className="mx-2 mt-2 aspect-video overflow-hidden rounded-lg bg-theme-secondary-300">
                <Img
                    className="h-full w-full object-cover"
                    wrapperClassName="h-full [&>span]:h-full"
                    alt={article.title}
                    src={article.image}
                />
            </div>

            <div className="flex flex-1 flex-col px-6 py-3">
                <div className="text-sm font-medium text-theme-secondary-700">
                    {formatTimestamp(
                        article.publishedAt,
                        user?.attributes.date_format as DateFormat,
                        user?.attributes.timezone,
                    )}
                </div>

                <h4 className="mt-1 line-clamp-2 text-lg font-medium leading-7 text-theme-secondary-900">
                    {article.title}
                </h4>
            </div>

            <div className="flex items-center bg-theme-secondary-50 px-6 py-3">
                <span className="mr-2 shrink-0 text-sm font-medium text-theme-secondary-700">
                    {t("pages.articles.featured_collections")}:
                </span>

                <FeaturedCollections collections={article.featuredCollections} />
            </div>
        </a>
    );
};
