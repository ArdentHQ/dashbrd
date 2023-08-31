import type { Meta } from "@storybook/react";
import { CollectionPortfolioValue } from "@/Components/Collections/CollectionPortfolioValue";

export default {
    title: "Collections/CollectionPortfolioValue",
    component: CollectionPortfolioValue,
} as Meta<typeof CollectionPortfolioValue>;

export const Default = {
    render: (args) => {
        return <CollectionPortfolioValue {...args} />;
    },
};

Default.args = {
    value: "1001000000000000000",
    token: {
        symbol: "DARK",
        decimals: 18,
    },
    user: {
        attributes: {
            currency: "USD",
            timezone: "Europe/Paris",
        },
    },
    convertedValue: "3508.09",
};
