import Markdown from "react-markdown";
import rehypeExternalLinks from "rehype-external-links";
import rehypeRaw from "rehype-raw";
import { remarkFigurePlugin } from "@/Utils/Remark/remarkFigurePlugin";

interface Properties {
    article: App.Data.Articles.ArticleData;
}

export const ArticleContent = ({ article }: Properties): JSX.Element => (
    <div className="article-content">
        <Markdown
            rehypePlugins={[rehypeRaw, [rehypeExternalLinks, { target: "_blank" }]]}
            remarkPlugins={[remarkFigurePlugin]}
            skipHtml
        >
            {article.content}
        </Markdown>
    </div>
);
