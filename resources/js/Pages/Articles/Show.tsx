import { ArticleShare } from "./Components/ArticleShare";
import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

const ArticlesShow = ({ article }: { article: App.Data.Articles.ArticleData }): JSX.Element => (
    <DefaultLayout>
        <article className="w-full lg:px-8 2xl:px-0">
            <div className="article-wrapper -mt-6 px-8 sm:-mt-8 md:px-24 lg:mt-0 lg:rounded-xl lg:border lg:border-theme-secondary-300 lg:px-0">
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
                            src={article.image}
                        />
                    </div>

                    <div className="relative mt-6 pb-6">
                        <div className="top-8 hidden md:sticky md:block">
                            <ArticleShare
                                article={article}
                                className="absolute -ml-[68px] flex flex-col space-y-2"
                            />
                        </div>

                        <div>
                            {/* Content here */}
                            {Array.from({ length: 100 }).map((_, index) => (
                                <p key={index}>Test scroll, replace with real content {index}</p>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="-mx-6 flex flex-col  border-b border-t border-theme-secondary-300 px-6 py-4 sm:-mx-8 sm:px-8 md:mx-0 md:rounded-xl md:border md:px-6 lg:rounded-none lg:border-x-0 lg:border-b-0">
                    <div className="flex justify-between">
                        <div className="flex">
                            <div>Author (TBD)</div>
                            <div>Date (TBD)</div>
                        </div>

                        <div className="hidden md:block">Copy (TBD)</div>
                    </div>
                    <div className="mt-4 flex justify-between border-t border-dashed border-theme-secondary-400 pt-4 md:hidden">
                        <div>
                            <ArticleShare
                                article={article}
                                className="flex space-x-2"
                            />
                        </div>

                        <div>Copy Mobile (TBD)</div>
                    </div>
                </div>
            </div>
        </article>
    </DefaultLayout>
);

export default ArticlesShow;
