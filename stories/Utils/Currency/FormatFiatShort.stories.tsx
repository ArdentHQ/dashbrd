import type { Meta } from "@storybook/react";

import { FormatFiatShort } from "@/Utils/Currency";

export default {
    title: "Utils/Currency/FiatShort",
    component: FormatFiatShort,
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
} as Meta<typeof FormatFiatShort>;

export const Default = {
    render: (args) => <FormatFiatShort {...args} />,
    args: {
        value: "12300",
        currency: "USD",
    },
};
