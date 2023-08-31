import type { Meta, StoryFn } from "@storybook/react";

import { FormatCrypto } from "@/Utils/Currency";

export default {
    title: "Utils/Currency/Crypto",
    component: FormatCrypto,
    argTypes: {
        token: {
            control: "select",
            options: ["BTC", "ETH", "MATIC"],
            defaultValue: "BTC",
            mapping: {
                BTC: { symbol: "BTC", name: "BTC", decimals: 8 },
                ETH: { symbol: "ETH", name: "ETH", decimals: 18 },
                MATIC: { symbol: "MATIC", name: "MATIC", decimals: 18 },
            },
        },
    },
} as Meta<typeof FormatCrypto>;

const Template: StoryFn<typeof FormatCrypto> = (args) => <FormatCrypto {...args} />;

export const Default = Template.bind();

Default.args = {
    value: "10000000",
    token: "BTC",
};
