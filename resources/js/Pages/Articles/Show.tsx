import { ArticleAuthor } from "./Components/ArticleAuthor";
import { ArticleContent } from "./Components/ArticleContent";
import { ArticleCopy } from "./Components/ArticleCopy";
import { ArticleDate } from "./Components/ArticleDate";
import { ArticleShare } from "./Components/ArticleShare";
import { FeaturedCollectionsBanner } from "@/Components/FeaturedCollectionsBanner";
import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { ArticlesScroll } from "@/Pages/Collections/Components/Articles/ArticlesScroll";
import { tp } from "@/Utils/TranslatePlural";

interface Properties {
    article: App.Data.Articles.ArticleData;
    popularArticles: App.Data.Articles.ArticleData[];
}

const ArticlesShow = ({ article, popularArticles }: Properties): JSX.Element => (
    <DefaultLayout>
        <article className="w-full lg:px-8 2xl:px-0">
            <div className="article-wrapper -mt-6 px-6 sm:-mt-8 sm:px-8 md:px-24 lg:mt-0 lg:rounded-xl lg:border lg:border-theme-secondary-300 lg:px-0">
                <div className="mx-auto bg-white/20 pt-8 md:max-w-[768px] xl:max-w-[1000px]">
                    <div className="border-b-2 border-theme-secondary-400 pb-3">
                        <Heading level={1}>{article.title}</Heading>
                    </div>
                </div>

                <div className="mx-auto mt-6 md:max-w-[768px] xl:max-w-[1000px]">
                    <div className="aspect-video overflow-hidden rounded-lg bg-theme-secondary-300 ">
                        <Img
                            className="h-full w-full rounded-lg object-cover"
                            wrapperClassName="h-full [&>span]:h-full bg-white"
                            alt={article.title}
                            srcSet={`${article.image.large} 1x, ${article.image.large2x} 2x`}
                            src={article.image.large}
                        />
                    </div>

                    <div className="relative mt-6 flex items-start pb-6">
                        <div className="bottom-8 top-8 hidden min-h-[136px] md:sticky  md:block">
                            <ArticleShare
                                article={article}
                                className="absolute -ml-[68px] flex flex-col space-y-2"
                            />
                        </div>

                        <ArticleContent article={article} />
                    </div>
                </div>

                <div className="-mx-6 flex flex-col border-b border-t border-theme-secondary-300 px-6 py-4 sm:-mx-8 sm:px-8 md:mx-0 md:rounded-xl md:border md:px-6 lg:rounded-none lg:border-x-0 lg:border-b-0">
                    <div className="flex items-center justify-between">
                        <div className="flex overflow-auto">
                            <ArticleAuthor article={article} />

                            <div className="mx-6 border-r border-theme-secondary-300"></div>

                            <ArticleDate article={article} />
                        </div>

                        <div className="hidden md:block">
                            <ArticleCopy article={article} />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between border-t border-dashed border-theme-secondary-400 pt-4 md:hidden">
                        <div>
                            <ArticleShare
                                article={article}
                                className="flex space-x-2"
                            />
                        </div>

                        <div>
                            <ArticleCopy article={article} />
                        </div>
                    </div>
                </div>
            </div>
        </article>
        <div className="px-6 pt-6 sm:px-8 md:px-24 md:pt-3 lg:px-8 2xl:px-0">
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