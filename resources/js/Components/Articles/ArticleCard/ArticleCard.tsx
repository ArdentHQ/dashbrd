import cn from "classnames";
import { useTranslation } from "react-i18next";
import { FeaturedCollections } from "@/Components/Articles/Article.blocks";
import { Img } from "@/Components/Image";
import { useActiveUser } from "@/Contexts/ActiveUserContext";
import { type DateFormat } from "@/Types/enums";
import { formatTimestamp } from "@/Utils/dates";

export type ArticleCardVariant = "normal" | "large";

export const ArticleCard = ({
    article,
    variant,
}: {
    article: App.Data.Articles.ArticleData;
    variant?: ArticleCardVariant;
}): JSX.Element => {
    const { t } = useTranslation();
    const { user } = useActiveUser();

    const isLargeVariant = variant === "large";

    return (
        <a
            data-testid="ArticleCard"
            href={route("articles.view", article.slug)}
            className={cn(
                "transition-default group flex h-full w-full flex-col overflow-hidden rounded-xl border border-theme-secondary-300",
                {
                    "bg-white ring-theme-primary-100 hover:ring": !isLargeVariant,
                    "bg-theme-dark-900 hover:bg-theme-primary-700": isLargeVariant,
                },
            )}
        >
            <div className="mx-2 mt-2 aspect-video overflow-hidden rounded-lg bg-theme-secondary-300">
                <Img
                    className="h-full w-full rounded-lg object-cover"
                    wrapperClassName={cn("h-full [&>span]:h-full", {
                        "bg-white": !isLargeVariant,
                        "bg-theme-dark-900 group-hover:bg-theme-primary-700": isLargeVariant,
                    })}
                    alt={article.title}
                    srcSet={`${article.image.medium} 1x, ${article.image.medium2x} 2x`}
                    src={article.image.medium}
                />
            </div>

            <div className="flex flex-1 flex-col px-6 py-3">
                <div
                    className={cn("transition-default text-sm font-medium", {
                        "text-theme-secondary-700": !isLargeVariant,
                        "text-theme-secondary-500 group-hover:text-theme-primary-300": isLargeVariant,
                    })}
                >
                    {formatTimestamp(
                        article.publishedAt * 1000,
                        user?.attributes.date_format as DateFormat,
                        user?.attributes.timezone,
                    )}
                </div>

                <h4
                    className={cn("transition-default mt-1 line-clamp-2 max-h-[3.5rem] text-lg font-medium leading-7", {
                        "text-theme-secondary-900 group-hover:text-theme-primary-700": !isLargeVariant,
                        "text-white": isLargeVariant,
                    })}
                >
                    {article.title}
                </h4>
            </div>

            <div
                className={cn("transition-default flex items-center px-6 py-3", {
                    "bg-theme-secondary-50": !isLargeVariant,
                    "bg-theme-dark-950 group-hover:bg-theme-primary-800": isLargeVariant,
                })}
            >
                <span
                    className={cn("mr-2 shrink-0 text-sm font-medium", {
                        "text-theme-secondary-700": !isLargeVariant,
                        "text-theme-secondary-500 group-hover:text-theme-primary-300": isLargeVariant,
                    })}
                >
                    {t("pages.articles.featured_collections")}:
                </span>

                <FeaturedCollections
                    collections={article.featuredCollections}
                    variant={variant}
                />
            </div>
        </a>
    );
};
