import type { Meta, StoryFn } from "@storybook/react";
import { CollectionCard } from "@/Components/Collections/CollectionCard";
import CollectionNftDataFactory from "@/Tests/Factories/Collections/CollectionNftDataFactory";
import CollectionFactory from "@/Tests/Factories/Collections/CollectionFactory";

const collection = new CollectionFactory().create();
const nfts = new CollectionNftDataFactory().createMany(3, {
    collectionId: collection.id,
});

export default {
    title: "Collections/CollectionCard",
    argTypes: {
        count: {
            control: {
                type: "range",
                min: 1,
                max: nfts.length,
            },
            defaultValue: 3,
        },
    },
} as Meta<typeof CollectionCard>;

const Template: StoryFn<typeof CollectionCard> = (args) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <CollectionCard {...args} />
    </div>
);

export const Default = {
    render: (args) => {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <CollectionCard {...args} />
            </div>
        );
    },
};

Default.args = {
    collection,
    nfts,
    onChanged: () => {},
};
