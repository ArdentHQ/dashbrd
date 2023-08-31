import type { Meta } from "@storybook/react";

import { Avatar } from "@/Components/Avatar";

export default {
    title: "Base/Avatar",
    component: Avatar,
    argTypes: {
        address: { control: "text" },
        size: {
            control: "select",
            options: [20, 120],
            defaultValue: 20,
        },
    },
} as Meta<typeof Avatar>;

export const Default = {
    render: (args) => (
        <span>
            <Avatar {...args} />
        </span>
    ),
    args: {
        address: "0x1234567890123456789012345678901234567890",
        size: 20,
    },
};
