import cn from "classnames";
import { useTranslation } from "react-i18next";
import { ArticleErrorImage } from "./ArticleErrorImage";
import { FeaturedCollections } from "@/Components/Articles/Article.blocks";
import { Img } from "@/Components/Image";
import { Link } from "@/Components/Link";
import { useAuth } from "@/Contexts/AuthContext";
import { type DateFormat } from "@/Types/enums";
import { formatTimestamp } from "@/Utils/dates";

export type ArticleCardVariant = "normal" | "large";

export const ArticleCard = ({
    article,
    variant,
    className,
}: {
    article: App.Data.Articles.ArticleData;
    variant?: ArticleCardVariant;
    className?: string;
}): JSX.Element => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const isLargeVariant = variant === "large";

    return (
        <Link
            data-testid="ArticleCard"
            href={route("articles.view", article.slug)}
            className={cn(
                "transition-default group flex h-full w-full flex-col overflow-hidden rounded-xl border border-theme-secondary-300",
                {
                    "bg-white ring-theme-primary-100 dark:border-theme-dark-700 dark:bg-theme-dark-900 ":
                        !isLargeVariant,
                    "bg-theme-dark-900 hover:bg-theme-primary-700 dark:border-none dark:bg-theme-primary-700 dark:hover:bg-theme-primary-600":
                        isLargeVariant,
                },
                className,
            )}
        >
            <div className="mx-2 mt-2 aspect-video overflow-hidden rounded-lg bg-theme-secondary-300">
                <Img
                    className={cn("h-full w-full rounded-lg object-cover", {
                        "skeleton-primary": isLargeVariant,
                    })}
                    wrapperClassName={cn("h-full [&>span]:h-full", {
                        "bg-white dark:bg-theme-primary-900 ": !isLargeVariant,
                        "bg-theme-dark-900 group-hover:bg-theme-primary-700 dark:bg-theme-primary-700 dark:group-hover:bg-theme-primary-600":
                            isLargeVariant,
                    })}
                    alt={article.title}
                    srcSet={`${article.image.medium} 1x, ${article.image.medium2x} 2x`}
                    src={article.image.medium}
                    errorPlaceholder={
                        isLargeVariant ? <ArticleErrorImage isLargeVariant={isLargeVariant} /> : undefined
                    }
                />
            </div>

            <div className="flex flex-1 flex-col px-6 py-3">
                <div
                    className={cn("transition-default text-sm font-medium", {
                        "text-theme-secondary-700 dark:text-theme-dark-200": !isLargeVariant,
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
                    className={cn(
                        "transition-default mt-1 line-clamp-2 max-h-[3.5rem] break-words text-lg font-medium leading-7",
                        {
                            "text-theme-secondary-900 group-hover:text-theme-primary-700 dark:text-theme-dark-50 dark:group-hover:text-theme-primary-400":
                                !isLargeVariant,
                            "text-theme-secondary-300": isLargeVariant,
                        },
                    )}
                >
                    {article.title}
                </h4>
            </div>

            <div
                className={cn("transition-default flex items-center rounded-b-lg px-6 py-3", {
                    "bg-theme-secondary-50 dark:bg-theme-dark-800": !isLargeVariant,
                    "bg-theme-dark-950 group-hover:bg-theme-primary-800 dark:bg-theme-primary-800 dark:group-hover:bg-theme-primary-700":
                        isLargeVariant,
                })}
            >
                <span
                    className={cn("mr-2 shrink-0 text-sm font-medium", {
                        "text-theme-secondary-700 dark:text-theme-dark-200": !isLargeVariant,
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
        </Link>
    );
};
