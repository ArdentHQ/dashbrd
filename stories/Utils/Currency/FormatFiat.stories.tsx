import type { Meta } from "@storybook/react";

import { FormatFiat } from "@/Utils/Currency";

export default {
    title: "Utils/Currency/Fiat",
    component: FormatFiat,
    argTypes: {
        currency: {
            control: "select",
            options: ["None", "USD", "EUR", "GBP"],
            defaultValue: "USD",
            mapping: {
                None: null,
            },
        },

        user: {
            control: "select",
            options: ["Logged Out", "Logged In with USD", "Logged In with EUR"],
            defaultValue: "Logged Out",
            mapping: {
                "Logged Out": null,
                "Logged In with USD": { currency: "USD" },
                "Logged In with EUR": { currency: "EUR" },
            },
        },
    },
} as Meta<typeof FormatFiat>;

export const Default = {
    render: (args) => <FormatFiat {...args} />,
    args: {
        value: "12300",
        currency: "USD",
    },
};
