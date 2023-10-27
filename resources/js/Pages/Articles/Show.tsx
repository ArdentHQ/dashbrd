import { ArticleContent } from "./Components/ArticleContent";
import { ArticleMeta } from "./Components/ArticleMeta";
import { ArticleShare } from "./Components/ArticleShare";
import { FeaturedCollectionsBanner } from "@/Components/FeaturedCollectionsBanner";
import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { WaveSurferPlayer } from "@/Pages/Articles/Components/WaveSurferPlayer";
import { ArticlesScroll } from "@/Pages/Collections/Components/Articles/ArticlesScroll";
import { tp } from "@/Utils/TranslatePlural";

interface Properties {
    article: App.Data.Articles.ArticleData;
    popularArticles: App.Data.Articles.ArticleData[];
}

const ArticlesShow = ({ article, popularArticles }: Properties): JSX.Element => (
    <DefaultLayout>
        <article className="w-full lg:px-8 2xl:px-0">
            <div className="article-wrapper -mt-6 sm:-mt-8  lg:mt-0 lg:rounded-xl lg:border lg:border-theme-secondary-300 dark:lg:border-theme-dark-700">
                <div className=" px-6 sm:px-8 md:px-24 lg:px-0">
                    <div className="mx-auto bg-white/20 pt-8 dark:bg-transparent md:max-w-[768px] xl:max-w-[1000px]">
                        <div className="border-b border-theme-secondary-400 pb-3 dark:border-theme-dark-700">
                            <Heading level={1}>{article.title}</Heading>
                        </div>
                    </div>

                    <div className="mx-auto mt-6  md:max-w-[768px] xl:max-w-[1000px]">
                        <div className="aspect-video overflow-hidden rounded-lg bg-theme-secondary-300 dark:bg-theme-dark-700">
                            <Img
                                className="h-full w-full rounded-lg object-cover"
                                wrapperClassName="h-full [&>span]:h-full bg-white dark:bg-theme-dark-950"
                                alt={article.title}
                                srcSet={`${article.image.large} 1x, ${article.image.large2x} 2x`}
                                src={article.image.large}
                            />
                        </div>

                        <div className="relative mt-6 flex items-start pb-6">
                            <div className="bottom-8 top-8 hidden min-h-[190px] md:sticky md:block">
                                <ArticleShare
                                    article={article}
                                    className="absolute -ml-[68px] flex flex-col space-y-2"
                                />
                            </div>
                            <div>
                                {article.audioSrc && (
                                    <div className="mb-4">
                                        <WaveSurferPlayer url={article.audioSrc} />
                                    </div>
                                )}

                                <ArticleContent article={article} />
                            </div>
                        </div>
                    </div>
                </div>

                <ArticleMeta article={article} />
            </div>
        </article>

        <div className="px-6 pt-6 sm:px-8 md:pt-3 2xl:px-0">
            <FeaturedCollectionsBanner
                collections={article.featuredCollections}
                subtitle={tp("pages.articles.consists_of_collections", article.featuredCollections.length, {
                    count: article.featuredCollections.length,
                })}
            />
        </div>

        {popularArticles.length > 0 && <ArticlesScroll articles={popularArticles} />}
    </DefaultLayout>
);

export default ArticlesShow;
