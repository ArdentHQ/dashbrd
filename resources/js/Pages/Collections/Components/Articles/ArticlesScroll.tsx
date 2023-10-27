import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { Carousel, CarouselItem } from "@/Components/Carousel";
import { useCarousel } from "@/Hooks/useCarousel";

export const ArticlesScroll = ({ articles }: { articles: App.Data.Articles.ArticleData[] }): JSX.Element => {
    const { t } = useTranslation();

    const { slidesPerView, horizontalOffset } = useCarousel();

    return (
        <div className="articles-scroll mt-8">
            <Carousel
                horizontalOffset={horizontalOffset}
                headerClassName="mx-6 sm:mx-8 2xl:mx-0"
                swiperClassName="-m-1 lg:mx-7 2xl:-m-1"
                spaceBetween={8}
                slidesPerView={slidesPerView}
                title={
                    <>
                        <span className="text-theme-primary-600 dark:text-theme-primary-400">
                            {t("common.most_popular")}
                        </span>{" "}
                        {t("common.articles")}
                    </>
                }
                navigationClass={classNames("hidden space-x-3", {
                    "md:flex lg:hidden": articles.length === 3,
                    "md:flex xl:hidden": articles.length > 3,
                })}
            >
                {articles.map((article) => (
                    <CarouselItem key={article.id}>
                        <ArticleCard
                            className="m-1"
                            article={article}
                        />
                    </CarouselItem>
                ))}
            </Carousel>
        </div>
    );
};
