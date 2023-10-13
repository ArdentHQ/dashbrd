import cn from "classnames";
import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { ArticleCardSkeleton } from "@/Components/Articles/ArticleCard/ArticleCardSkeleton";
import { Carousel, CarouselItem } from "@/Components/Carousel";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { articlesViewDefaults } from "@/Pages/Articles/Components/ArticlesView";

export const HighlightedArticles = ({
    articles,
    withFullBorder,
    isLoading,
}: {
    articles: App.Data.Articles.ArticleData[];
    withFullBorder: boolean;
    isLoading: boolean;
}): JSX.Element => {
    const slidesPerView = useArticlesSlidesPerPage();

    const pagination = {
        clickable: true,
        renderBullet: (_index: number, className: string) => `<span class="h-1.5 rounded-xl w-6 ${className}"></span>`,
    };

    const { highlightedArticlesCount } = articlesViewDefaults;

    const articlePlaceHolders = Array.from({
        length: highlightedArticlesCount - articles.length,
    });

    const hasEnoughArticles = articles.length === highlightedArticlesCount;

    return (
        <div className={cn("w-full pt-2 ", { "mb-6": !withFullBorder, "lg:mb-6": withFullBorder })}>
            <div
                className={cn("latest-articles-carousel w-full", {
                    "pb-6": slidesPerView < highlightedArticlesCount,
                })}
            >
                <Carousel
                    swiperClassName="flex pb-6"
                    shouldShowHeader={false}
                    slidesPerView={slidesPerView}
                    pagination={pagination}
                >
                    {articles.map((article, index) => (
                        <CarouselItem key={index}>
                            <ArticleCard
                                article={article}
                                variant="large"
                            />
                        </CarouselItem>
                    ))}

                    {articlePlaceHolders.map((_v, index) => (
                        <CarouselItem key={index}>
                            <ArticleCardSkeleton
                                key={index}
                                isLoading={isLoading}
                            />
                        </CarouselItem>
                    ))}
                </Carousel>
            </div>
            <div
                className={cn("mt-0", {
                    "-mx-6 -mt-6 space-y-2 border-b-4 border-theme-secondary-100 sm:-mx-8 lg:mx-0 lg:border-b-2 lg:border-theme-secondary-300":
                        withFullBorder && (hasEnoughArticles || isLoading),
                    "border-b-2 border-theme-secondary-300": !withFullBorder && (hasEnoughArticles || isLoading),
                })}
            ></div>
        </div>
    );
};

const useArticlesSlidesPerPage = (): number => {
    const { is2Xs, isXs, isSm, isMd, isMdLg } = useBreakpoint();

    if (isXs || is2Xs || isSm) return 1;

    if (isMdLg || isMd) return 2;

    return 3;
};
