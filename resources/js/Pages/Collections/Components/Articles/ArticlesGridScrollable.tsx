import classNames from "classnames";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { IconButton } from "@/Components/Buttons";
import { Heading } from "@/Components/Heading";

export const ArticlesGridScrollable = ({ articles }: { articles: App.Data.Articles.ArticleData[] }): JSX.Element => {
    const { t } = useTranslation();

    const scroller = useRef<HTMLDivElement>(null);
    const [activeArticleIndex, setActiveArticleIndex] = useState(0);
    const [nextButtonIsDisabled, setNextButtonIsDisabled] = useState(false);

    const getArticleWidth = (): number => scroller.current?.children[0].clientWidth ?? 0;

    const previousHandler = (): void => {
        const articleWidth = getArticleWidth();

        const nextArticleIndex = activeArticleIndex - 1;

        scroller.current?.scrollTo({
            left: nextArticleIndex * articleWidth,
            behavior: "smooth",
        });
    };

    const nextHandler = (): void => {
        const articleWidth = getArticleWidth();

        const nextArticleIndex = activeArticleIndex + 1;

        scroller.current?.scrollTo({
            left: nextArticleIndex * articleWidth,
            behavior: "smooth",
        });
    };

    const scrollHandler = (event: React.UIEvent<HTMLDivElement>): void => {
        const div = event.target as HTMLDivElement;

        const scrollPosition = div.scrollLeft;

        const articleWidth = getArticleWidth();

        const articleIndex = Math.round(scrollPosition / articleWidth);

        setActiveArticleIndex(articleIndex);

        setNextButtonIsDisabled(!(div.scrollWidth > Math.ceil(div.clientWidth + div.scrollLeft)));
    };

    return (
        <div className="mt-8">
            <div className="flex w-full items-center justify-between px-6 sm:px-8 lg:px-8 2xl:px-0">
                <Heading level={2}>
                    <span className="text-theme-primary-600">{t("common.most_popular")}</span> {t("common.articles")}
                </Heading>

                {articles.length >= 3 && (
                    <div
                        className={classNames("hidden space-x-3", {
                            "md:flex lg:hidden": articles.length === 3,
                            "md:flex xl:hidden": articles.length > 3,
                        })}
                    >
                        <IconButton
                            disabled={activeArticleIndex === 0}
                            icon="ChevronLeftSmall"
                            onClick={previousHandler}
                        />

                        <IconButton
                            disabled={nextButtonIsDisabled}
                            icon="ChevronRightSmall"
                            onClick={nextHandler}
                        />
                    </div>
                )}
            </div>

            <div className="mt-4 xl:-mx-1.5 xl:px-8 2xl:px-0">
                <div
                    ref={scroller}
                    className="hide-scrollbar flex max-w-full snap-x scroll-px-[18px] overflow-x-auto px-[18px] sm:scroll-px-[26px] sm:px-[26px] xl:px-0"
                    onScroll={scrollHandler}
                >
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
        </div>
    );
};
