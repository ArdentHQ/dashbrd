import type { Meta } from "@storybook/react";
import { CollectionImages } from "@/Components/Collections/CollectionImages";

import nfts from "@/Tests/Fixtures/nfts.json";

export default {
    title: "Collections/CollectionImages",
    argTypes: {
        maxItems: {
            table: {
                disable: true,
            },
            control: false,
        },
        count: {
            control: {
                type: "range",
                min: 1,
                max: nfts.length,
            },
            defaultValue: 3,
        },
    },
} as Meta<typeof CollectionImages>;

export const Default = {
    render: (args) => {
        return <CollectionImages nfts={args.nfts.slice(0, args.count)} />;
    },
    nfts,
};

Default.args = {
    nfts,
    count: 4,
};
