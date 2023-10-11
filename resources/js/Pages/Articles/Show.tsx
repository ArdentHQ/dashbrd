import { DefaultLayout } from "@/Layouts/DefaultLayout";

const ArticlesShow = ({ article }: { article: App.Data.Articles.ArticleData }): JSX.Element => (
    <DefaultLayout>
        <div className="mx-6 sm:mx-8 2xl:mx-0">{article.title}</div>
    </DefaultLayout>
);

export default ArticlesShow;
