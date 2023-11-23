import { remarkFigurePlugin } from "./remarkFigurePlugin";
import { type NodeWithChildren } from "./remarkPlugins.contract";

describe("remarkFigurePlugin", () => {
    it("should transform tree correctly", () => {
        const tree: NodeWithChildren = {
            type: "root",
            children: [
                {
                    type: "paragraph",
                    children: [
                        {
                            type: "image",
                            url: "image_url",
                            alt: "image_alt",
                            children: [],
                        },
                    ],
                },
                {
                    type: "blockquote",
                    children: [
                        {
                            type: "paragraph",
                            children: [
                                {
                                    type: "text",
                                    value: "caption_text",
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        remarkFigurePlugin()(tree);

        // Check your transformed tree structure here.
        // Replace with actual values
        expect(tree.children[0].value).toBe(`<figure>
  <img src="image_url" alt="image_alt"/>
  <figcaption>caption_text</figcaption>
</figure>`);
    });

    it("should not transform if previous node is not paragraph with image", () => {
        const tree: NodeWithChildren = {
            type: "root",
            children: [
                {
                    type: "paragraph",
                    value: "paragraph_text",
                    children: [],
                },
                {
                    type: "blockquote",
                    children: [
                        {
                            type: "paragraph",
                            children: [
                                {
                                    type: "text",
                                    value: "caption_text",
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const originalTree: string = JSON.parse(JSON.stringify(tree)) as string;

        remarkFigurePlugin()(tree);

        expect(tree).toEqual(originalTree);
    });

    it("should not transform if no previous node", () => {
        const tree: NodeWithChildren = {
            type: "root",
            children: [
                {
                    type: "blockquote",
                    children: [
                        {
                            type: "paragraph",
                            children: [
                                {
                                    type: "text",
                                    value: "caption_text",
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const originalTree: string = JSON.parse(JSON.stringify(tree)) as string;

        remarkFigurePlugin()(tree);

        expect(tree).toEqual(originalTree);
    });
});
