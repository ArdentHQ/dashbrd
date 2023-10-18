import { useTranslation } from "react-i18next";
import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { IconButton } from "@/Components/Buttons";
import { Heading } from "@/Components/Heading";

export const ArticlesGridScrollable = ({ articles }: { articles: App.Data.Articles.ArticleData[] }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="mt-8">
            <div className="flex w-full items-center justify-between px-6 sm:px-8 lg:px-8 2xl:px-0">
                <Heading level={2}>
                    <span className="text-theme-primary-600">{t("common.most_popular")}</span> {t("common.articles")}
                </Heading>

                <div className="hidden space-x-3 md:flex xl:hidden">
                    <IconButton icon="ChevronLeftSmall" />

                    <IconButton
                        disabled
                        icon="ChevronRightSmall"
                    />
                </div>
            </div>

            <div className="mt-4 xl:-mx-1.5 xl:px-8 2xl:px-0">
                <div className=" flex max-w-full snap-x scroll-px-[18px] overflow-x-auto px-[18px] sm:scroll-px-[26px] sm:px-[26px] xl:px-0">
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
