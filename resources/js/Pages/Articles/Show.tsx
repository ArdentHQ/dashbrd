import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

const ArticlesShow = ({ article }: { article: App.Data.Articles.ArticleData }): JSX.Element => (
    <DefaultLayout>
        <article className=" w-full lg:px-8 2xl:px-0">
            <div className="article-wrapper -mt-6 px-8 pb-6 sm:-mt-8 md:px-24 lg:mt-0 lg:overflow-hidden lg:rounded-xl lg:border lg:border-theme-secondary-300 lg:px-0">
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
                </div>
            </div>
        </article>
    </DefaultLayout>
);

export default ArticlesShow;
