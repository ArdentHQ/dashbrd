import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import html from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remark2rehype from "remark-rehype";
import { unified } from "unified";

interface Properties {
    article: App.Data.Articles.ArticleData;
}

const remarkFigure = () => (tree) => {
    const nodesToReplace = [];
    let previous;

    tree.children.forEach((node, index, parent) => {
        if (node.type === "blockquote") {
            previous = parent[index - 1];

            if (previous && previous.type === "paragraph" && previous.children[0].type === "image") {
                nodesToReplace.push({ figure: previous, caption: node, index: index - 1, parent });
            }
        }
    });

    for (const { figure, caption, index, parent } of nodesToReplace.reverse()) {
        const altText = figure.children[0].alt;
        const url = figure.children[0].url;

        // Convert the AST of the paragraph children to HTML
        const rehypeAst = unified().use(remark2rehype).runSync(caption.children[0]);
        const figcaptionHtml = unified()
            .use(html)
            .stringify(rehypeAst)
            .replace(/^<p>/, "")
            .replace(/<\/p>$/, "");

        parent.splice(index, 2, {
            type: "html",
            value: `<figure>\n  <img src="${url}" alt="${altText}"/>\n  <figcaption>${figcaptionHtml}</figcaption>\n</figure>`,
        });
    }
};

export const ArticleContent = ({ article }: Properties): JSX.Element => (
    <div className="article-content">
        <Markdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm, remarkFigure]}
        >
            {article.content}
        </Markdown>
    </div>
);
