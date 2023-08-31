import { Meta } from "@storybook/react";

import { CollectionActions } from "@/Components/Collections/CollectionActions/CollectionActions";

export default {
    title: "Collections/CollectionActions",
    component: CollectionActions,
    argTypes: {
        isHidden: {
            control: "boolean",
            defaultValue: false,
        },
    },
} as Meta<typeof CollectionActions>;

export const Default = {
    render: (args) => {
        return (
            <div className="w-md flex max-w-md justify-end py-20">
                <CollectionActions {...args} />
            </div>
        );
    },
};
