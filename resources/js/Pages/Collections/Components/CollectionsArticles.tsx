import { Tab } from "@headlessui/react";
import cn from "classnames";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Carousel, CarouselControls, CarouselItem } from "@/Components/Carousel";
import { Heading } from "@/Components/Heading";
import { Tabs } from "@/Components/Tabs";
import { useCarousel } from "@/Hooks/useCarousel";

interface Properties {
    latest: App.Data.Articles.ArticleData[];
    popular: App.Data.Articles.ArticleData[];
}

type TabOption = "latest" | "popular";

export const CollectionsArticles = ({ latest, popular }: Properties): JSX.Element => {
    const [tab, setTab] = useState<TabOption>("latest");
    const articles = useMemo(() => (tab === "latest" ? latest : popular), [tab]);

    const { t } = useTranslation();
    const { slidesPerView, horizontalOffset } = useCarousel();

    return (
        <div className="articles-scroll mt-6 border-t-4 border-theme-secondary-200 pt-14 dark:border-theme-dark-800 sm:mt-8 sm:pt-8 lg:mt-12 lg:border-t-0 lg:pt-0">
            <div className="mb-4 px-6 2xl:px-0">
                <Heading level={1}>{t("pages.collections.articles.heading")}</Heading>

                <div className="mt-3 flex w-full items-center justify-between sm:mt-4">
                    <ArticleTabs
                        active={tab}
                        onChange={(tab) => {
                            setTab(tab);
                        }}
                    />

                    <CarouselControls
                        className="hidden sm:flex"
                        carouselKey="articles"
                        viewAllPath={route("articles")}
                        navigationClass="space-x-3"
                    />
                </div>
            </div>

            <Carousel
                carouselKey="articles"
                horizontalOffset={horizontalOffset}
                swiperClassName="-m-1 lg:-my-1 2xl:-m-1 lg:mx-7"
                spaceBetween={0}
                slidesPerView={slidesPerView}
                shouldShowHeader={false}
            >
                {articles.map((article) => (
                    <CarouselItem key={article.id}>
                        <div className="h-full p-1">
                            <ArticleCard article={article} />
                        </div>
                    </CarouselItem>
                ))}
            </Carousel>

            <div className="mt-4 px-6 sm:hidden">
                <ViewAllButton />
            </div>
        </div>
    );
};

const ArticleTabs = ({ active, onChange }: { active: TabOption; onChange: (tab: TabOption) => void }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tab.Group
            as="div"
            className="w-full sm:w-auto"
            defaultIndex={0}
        >
            <Tab.List>
                <Tabs>
                    <Tab as={Fragment}>
                        <Tabs.Button
                            selected={active === "latest"}
                            onClick={() => {
                                onChange("latest");
                            }}
                        >
                            {t("pages.collections.articles.sort_latest")}
                        </Tabs.Button>
                    </Tab>

                    <Tab as={Fragment}>
                        <Tabs.Button
                            selected={active === "popular"}
                            onClick={() => {
                                onChange("popular");
                            }}
                        >
                            {t("pages.collections.articles.sort_popularity")}
                        </Tabs.Button>
                    </Tab>
                </Tabs>
            </Tab.List>
        </Tab.Group>
    );
};

const ViewAllButton = ({ className }: { className?: string }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <ButtonLink
            variant="secondary"
            href={route("articles")}
            className={cn("w-full justify-center sm:w-auto", className)}
        >
            {t("common.view_all")}
        </ButtonLink>
    );
};
