import { Heading } from "@/Components/Heading";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

const ArticlesShow = ({ article }: { article: App.Data.Articles.ArticleData }): JSX.Element => (
    <DefaultLayout>
        <div className="article-wrapper rounded-xl border border-theme-secondary-300 pb-6 pt-8 sm:px-24">
            <article>
                <Heading level={1}>{article.title}</Heading>
            </article>
        </div>
    </DefaultLayout>
);

export default ArticlesShow;
