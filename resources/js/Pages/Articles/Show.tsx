import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

const ArticlesShow = ({ article }: { article: App.Data.Articles.ArticleData }): JSX.Element => (
    <DefaultLayout>
        <div className="overflow-hidden rounded-xl border border-theme-secondary-300 pb-6 pt-8 sm:px-24">
            <article>
                <div className="border-b border-theme-secondary-400 pb-3">
                    <Heading level={1}>{article.title}</Heading>
                </div>

                <div className="mt-6 aspect-video overflow-hidden rounded-lg bg-theme-secondary-300">
                    <Img
                        className="h-full w-full rounded-lg object-cover"
                        wrapperClassName="h-full [&>span]:h-full bg-white"
                        alt={article.title}
                        src={article.image}
                    />
                </div>
            </article>
        </div>
    </DefaultLayout>
);

export default ArticlesShow;
