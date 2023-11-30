/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NodeWithChildren } from "./remarkPlugins.contract";
import { remarkTwitterEmbedPlugin } from "./remarkTwitterEmbedPlugin";

describe("remarkTwitterEmbedPlugin", () => {
    it("transforms Twitter links into embeds", () => {
        const tree: NodeWithChildren = {
            type: "root",
            children: [
                {
                    type: "paragraph",
                    children: [
                        {
                            type: "image",
                            url: "twitter:bobconfer/status/1575764493795479552",
                            children: [],
                        },
                    ],
                },
            ],
        };

        remarkTwitterEmbedPlugin()(tree);

        expect(tree.children[0].type).toBe("html");
        expect(tree.children[0].value).toContain("twitter.com/bobconfer/status/1575764493795479552");
        expect(tree.children[0].value).toContain("twitter-tweet");
    });

    it("does not transform non-Twitter links", () => {
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

        const originalTree = JSON.parse(JSON.stringify(tree));

        remarkTwitterEmbedPlugin()(tree);

        expect(tree).toEqual(originalTree);
    });

    it("does not transform Twitter links if not the only child in a paragraph", () => {
        const tree: NodeWithChildren = {
            type: "root",
            children: [
                {
                    type: "paragraph",
                    children: [
                        {
                            type: "text",
                            value: "Random text",
                            children: [],
                        },
                        {
                            type: "image",
                            url: "twitter:bobconfer/status/1575764493795479552",
                            children: [],
                        },
                    ],
                },
            ],
        };

        const originalTree = JSON.parse(JSON.stringify(tree));

        remarkTwitterEmbedPlugin()(tree);

        expect(tree).toEqual(originalTree);
    });
});
