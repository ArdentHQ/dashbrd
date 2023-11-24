/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { visit } from "unist-util-visit";
import { type NodeWithChildren } from "./remarkPlugins.contract";

const transformTwitterNodes = (tree: NodeWithChildren): void => {
    visit(tree, "paragraph", (node: NodeWithChildren, index, parent) => {
        if (node.children.length === 1 && node.children[0].type === "image") {
            const imageNode = node.children[0];

            if (typeof imageNode.url === "string" && imageNode.url.startsWith("twitter:")) {
                const twitterPath = imageNode.url.replace("twitter:", "");

                parent!.children.splice(index!, 1, {
                    type: "html",
                    value: `<div class="twitter-embed-wrapper"><blockquote class="twitter-tweet"><a href="https://twitter.com/${twitterPath}"></a></blockquote></div><div class="twitter-embed-wrapper twitter-embed-wrapper-dark"><blockquote class="twitter-tweet" data-theme="dark"><a href="https://twitter.com/${twitterPath}"></a></blockquote></div>`,
                    children: [],
                });
            }
        }
    });
};

export const remarkTwitterEmbedPlugin = (): ((tree: NodeWithChildren) => void) => transformTwitterNodes;
