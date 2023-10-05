import type { Meta } from "@storybook/react";
import { FeaturedCollections } from "@/Components/Articles/Article.blocks";

export default {
    title: "Articles/FeaturedCollections",
} as Meta<typeof FeaturedCollections>;

export const Default = {
    render: ({ sets }: { sets: Array<App.Data.Articles.ArticleData["featuredCollections"]> }) => {
        return (
            <>
                {sets.map(({ collections, width }, index) => (
                    <div className="mb-4">
                        <div>
                            {" "}
                            Collection count: {collections.length} | Max width: {width}{" "}
                        </div>
                        <div className="mt-2 flex w-full flex-1">
                            <strong className="pr-2">Featured collections:</strong>
                            <div
                                className={`flex flex-1`}
                                style={{ maxWidth: width }}
                            >
                                <FeaturedCollections collections={collections} />
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    },
};

const collections = [
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_512,h_512/thumbnailv2/eth-mainnet/ef7f18b62946b17ff51c1a07f5c0e5c1",
        name: "Axolittle",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/d646455e202efca120610a8741a73204",
        name: "Epic Wizard Union",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/e5808dde0234b3244ace9a57230c2baf",
        name: "Rabbit College Club",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/e5928216456be6bb55e6cf1fb1c3e5b8",
        name: "Reckless Whales",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/3a62f5acd387614e2bdc48ffee1e5ec6",
        name: "Whiskers",
    },
];

Default.args = {
    sets: [
        {
            width: "70px",
            collections: collections.slice(0, 4),
        },

        {
            width: "70px",
            collections: collections.slice(0, 1),
        },

        {
            width: "140px",
            collections: collections,
        },
    ],
};
