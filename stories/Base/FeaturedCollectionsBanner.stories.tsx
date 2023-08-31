import type { StoryFn, Meta } from "@storybook/react";

import { FeaturedCollectionsBanner } from "@/Components/FeaturedCollectionsBanner";

export default {
    title: "Base/FeaturedCollectionsBanner",
} as Meta<typeof FeaturedCollectionsBanner>;

export const WithSlider = {
    render: (args) => {
        return (
            <FeaturedCollectionsBanner
                collections={Array.from({ length: 20 }).fill({
                    name: "Test",
                    address: "0xtest",
                    chainId: 137,
                    floorPrice: null,
                    floorPriceCurrency: null,
                    floorPriceDecimals: null,
                    floorPriceRetrievedAt: null,
                    website: "https://example.com",
                    image: null,
                })}
            />
        );
    },
};

export const Default = {
    render: (args) => <FeaturedCollectionsBanner {...args} />,
};
