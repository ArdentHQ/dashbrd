import { visit } from "unist-util-visit";
import { type NodeWithChildren } from "./remarkPlugins.contract";

const transformYouTubeNodes = (tree: NodeWithChildren): void => {
    visit(tree, "image", (node: NodeWithChildren) => {
        if (typeof node.url === "string" && node.url.startsWith("youtube:")) {
            const videoId = node.url.replace("youtube:", "");

            // Convert the node to an HTML node with the iframe embed
            node.type = "html";
            node.value = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
    });
};

export const remarkYoutubeEmbedPlugin = (): ((tree: NodeWithChildren) => void) => transformYouTubeNodes;
