import type { Meta } from "@storybook/react";

import { CollectionFloorPrice } from "@/Components/Collections/CollectionFloorPrice";

export default {
    title: "Collections/CollectionFloorPrice",
    component: CollectionFloorPrice,
} as Meta<typeof CollectionFloorPrice>;

export const Default = {
    render: (args) => <CollectionFloorPrice {...args} />,
    args: {
        collection: {
            floorPrice: "1000000000000000000",
        },
        token: {
            symbol: "DARK",
            decimals: 18,
        },
        user: {
            attributes: {
                currency: "EUR",
            },
        },
        fiatValue: "347.54",
    },
};

export const PriceChange = {
    render: (args) => <CollectionFloorPrice {...args} />,
    args: {
        collection: {
            floorPrice: "1000000000000000000",
        },
        token: {
            symbol: "DARK",
            decimals: 18,
        },
        percentageChange: 24.5678,
    },
};
