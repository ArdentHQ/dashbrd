import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

const ArticlesShow = ({ article }: { article: App.Data.Articles.ArticleData }): JSX.Element => (
    <DefaultLayout>
        <article className="article-wrapper -mt-6 pb-6 sm:-mt-8  lg:mx-8 lg:mt-0 lg:overflow-hidden lg:rounded-xl lg:border lg:border-theme-secondary-300">
            <div className="bg-white/20 px-8 pt-8 md:px-24">
                <div className="border-b-2 border-theme-secondary-400  pb-3">
                    <Heading level={1}>{article.title}</Heading>
                </div>
            </div>

            <div className="mt-6 px-8 md:px-24 ">
                <div className="aspect-video overflow-hidden rounded-lg bg-theme-secondary-300 ">
                    <Img
                        className="h-full w-full rounded-lg object-cover"
                        wrapperClassName="h-full [&>span]:h-full bg-white"
                        alt={article.title}
                        src={article.image}
                    />
                </div>
            </div>
        </article>
    </DefaultLayout>
);

export default ArticlesShow;
