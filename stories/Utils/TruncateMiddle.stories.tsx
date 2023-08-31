import type { Meta } from "@storybook/react";

import { TruncateMiddle } from "@/Utils/TruncateMiddle";

export default {
    title: "Utils/TruncateMiddle",
    component: TruncateMiddle,
    argTypes: {
        text: {
            control: "select",
            options: ["Text", "Address"],
            defaultValue: "Text",
            mapping: {
                Text: "This is some text",
                Address: "0x1234567890123456789012345678901234567890",
            },
        },
        length: {
            control: "number",
            defaultValue: 8,
        },
        separator: {
            control: "text",
        },
    },
} as Meta<typeof TruncateMiddle>;

export const Default = {
    render: (args) => <TruncateMiddle {...args} />,
    args: {
        length: 8,
        text: "Text",
    },
};
