import html from "rehype-stringify";
import remark2rehype from "remark-rehype";
import { unified } from "unified";
import { type Node } from "unist";

export interface NodeWithChildren extends Node {
    children: NodeWithChildren[];
    alt?: string;
    url?: string;
    value?: string;
}

interface NodeOptionalChildren extends Omit<Node, "children"> {
    children?: NodeWithChildren[];
    value?: string;
}

const transformTree = (tree: NodeWithChildren): void => {
    const nodesToReplace: Array<{
        figure: NodeWithChildren;
        caption: NodeWithChildren;
        parent: NodeOptionalChildren[];
        index: number;
    }> = [];

    for (let index = 0; index < tree.children.length; index++) {
        const node: NodeWithChildren = tree.children[index];

        if (node.type === "blockquote") {
            if (tree.children.length <= 1) {
                continue;
            }

            const previous: NodeWithChildren = tree.children[index - 1];

            if (
                previous.type === "paragraph" &&
                "children" in previous &&
                Array.isArray(previous.children) &&
                previous.children.length > 0 &&
                previous.children[0]?.type === "image"
            ) {
                nodesToReplace.push({ figure: previous, caption: node, index: index - 1, parent: tree.children });
            }
        }
    }

    for (const { figure, caption, index, parent } of nodesToReplace.reverse()) {
        const altText = figure.children[0].alt;
        const url = figure.children[0].url;

        const rehypeAst = unified()
            .use(remark2rehype)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            .runSync(caption.children[0] as any);

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

export const remarkFigurePlugin = (): ((tree: NodeWithChildren) => void) => transformTree;
