import cn from "classnames";
import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { Carousel, CarouselItem } from "@/Components/Carousel";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const LatestArticles = ({ articles, withFullBorder }: { articles: App.Data.Articles.ArticleData[], withFullBorder: boolean}): JSX.Element => {
    const slidesPerView = useArticlesCarousel();

    const pagination = {
        clickable: true,
        renderBullet: (_index: number, className: string) => `<span class="h-1.5 rounded-xl w-6 ${className}"></span>`,
    };

    return (
        <div className={cn("w-full pt-2 ", {"mb-6": !withFullBorder, "lg:mb-6": withFullBorder})}>
            <div
                className={cn("latest-articles-carousel w-full", {
                    "pb-6": slidesPerView < 3,
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
                </Carousel>
            </div>
            <div className={cn("mt-0", {
                "-mx-6 space-y-2 sm:-mx-8 lg:mx-0 -mt-6 border-b-4 border-theme-secondary-100 lg:border-theme-secondary-300 lg:border-b-2": withFullBorder,
                "border-b-2 border-theme-secondary-300": !withFullBorder,
            })}></div>
        </div>
    );
};

const useArticlesCarousel = (): number => {
    const { is2Xs, isXs, isSm, isMd, isMdLg } = useBreakpoint();

    if (isXs || is2Xs || isSm) return 1;

    if (isMdLg || isMd) return 2;

    return 3;
};
