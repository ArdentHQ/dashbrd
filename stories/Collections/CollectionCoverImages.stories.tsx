import type { Meta } from "@storybook/react";
import { CollectionCoverImages } from "@/Components/Collections/CollectionCoverImages/CollectionCoverImages";
import nfts from "@/Tests/Fixtures/nfts.json";

export default {
    title: "Collections/CollectionCoverImages",
    argTypes: {
        maxItems: {
            table: {
                disable: true,
            },
            control: false,
        },
        size: {
            control: {
                type: "range",
                min: 200,
                max: 800,
            },
            defaultValue: 3,
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
} as Meta<typeof CollectionCoverImages>;

export const Default = {
    render: (args) => {
        return (
            <div
                className="rounded-xl border-theme-secondary-500"
                style={{ width: args.size }}
            >
                <CollectionCoverImages nfts={args.nfts.slice(0, args.count)} />
            </div>
        );
    },
    nfts,
};

Default.args = {
    nfts,
    size: 200,
};
