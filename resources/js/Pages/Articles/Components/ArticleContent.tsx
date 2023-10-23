import Markdown from "react-markdown";

interface Properties {
    article: App.Data.Articles.ArticleData;
}

export const ArticleContent = ({ article }: Properties): JSX.Element => {
    console.log({ article });
    return (
        <div className="article-content">
            <Markdown>{article.content}</Markdown>
        </div>
    );
};
