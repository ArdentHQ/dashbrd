import { type NodeWithChildren } from "./remarkPlugins.contract";
import { remarkYoutubeEmbedPlugin } from "./remarkYoutubeEmbedPlugin";

describe("remarkYoutubeEmbedPlugin", () => {
    it("transforms YouTube links into iframe embeds", () => {
        const tree: NodeWithChildren = {
            type: "root",
            children: [
                {
                    type: "paragraph",
                    children: [
                        {
                            type: "image",
                            url: "youtube:bH1lHCirCGI",
                            children: [],
                        },
                    ],
                },
            ],
        };

        remarkYoutubeEmbedPlugin()(tree);

        expect(tree.children[0].children[0].type).toBe("html");
        expect(tree.children[0].children[0].value).toBe(
            '<iframe src="https://www.youtube.com/embed/bH1lHCirCGI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        );
    });

    it("does not transform non-YouTube links", () => {
        const tree: NodeWithChildren = {
            type: "root",
            children: [
                {
                    type: "paragraph",
                    children: [
                        {
                            type: "image",
                            url: "https://example.com/image.jpg",
                            children: [],
                        },
                    ],
                },
            ],
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const originalTree = JSON.parse(JSON.stringify(tree));

        remarkYoutubeEmbedPlugin()(tree);

        expect(tree).toEqual(originalTree);
    });
});
