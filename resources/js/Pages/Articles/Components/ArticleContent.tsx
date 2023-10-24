import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";

interface Properties {
    article: App.Data.Articles.ArticleData;
}

const remarkFigure = () => (tree) => {
    const nodesToReplace = [];
    const index = 0;
    let previous;

    function visit(node, index, parent) {
        previous = parent[index - 1];

        if (previous && previous.type === "paragraph" && previous.children[0].type === "image") {
            nodesToReplace.push({ figure: previous, caption: node, index: index - 1, parent: parent });
        }
    }

    tree.children.forEach((node, index, parent) => {
        if (node.type === "blockquote") {
            visit(node, index, parent);
        }
    });

    for (const { figure, caption, index, parent } of nodesToReplace.reverse()) {
        const altText = figure.children[0].alt;
        const url = figure.children[0].url;
        const figcaptionMdAST = unified().use(markdown).parse(caption.children[0].children[0].value);
        const rehypeAst = unified().use(remark2rehype).runSync(figcaptionMdAST);
        const figcaptionHtml = unified().use(html).stringify(rehypeAst);
        // console.log({ figcaptionHtml });

        console.log({
            figure,
            index,
            altText,
            url,
            figcaptionMdAST,
            figcaptionHtml,
        });

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
