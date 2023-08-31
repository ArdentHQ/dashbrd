import type { Meta, StoryFn } from "@storybook/react";

import { DonutChart as Component } from "@/Components/PortfolioBreakdown";

export default {
    title: "Base/PortfolioBreakdown",
    component: Component,
    argTypes: {
        currency: {
            control: "radio",
            options: ["USD", "EUR", "GBP"],
            defaultValue: "USD",
        },
    },
} as Meta<typeof Component>;

const Template: StoryFn<typeof Component> = (args) => <Component {...args} />;

export const DonutChart = Template.bind({});

DonutChart.args = {
    assets: [
        {
            token: {
                symbol: "AAVE",
                name: "Aave",
                decimals: 18,
            },
            balance: "76585573041076100000",
            convertedBalance: 8974.15,
            percent: 36,
        },
        {
            token: {
                symbol: "ARK",
                name: "ARK",
                decimals: 18,
            },
            balance: "73136532604216200000",
            convertedBalance: 8646.64,
            percent: 32,
        },
        {
            token: {
                symbol: "MATIC",
                name: "Polygon",
                decimals: 18,
            },
            balance: "19186364055222900000",
            convertedBalance: 4516.54,
            percent: 18,
        },
        {
            token: {
                symbol: "LINK",
                name: "Chainlink",
                decimals: 18,
            },
            balance: "4137353971075530000",
            convertedBalance: 1641.64,
            percent: 12.8,
        },
        {
            token: {
                symbol: "CRV",
                name: "Curve DAO Token",
                decimals: 18,
            },
            balance: "9924982055311020",
            convertedBalance: 68.42,
            percent: 0.7,
        },
        {
            token: {
                symbol: "SUSHI",
                name: "SushiSwap",
                decimals: 18,
            },
            balance: "3319875635043330645",
            convertedBalance: 21.84,
            percent: 0.3,
        },
        {
            token: {
                symbol: "SUSHI",
                name: "SushiSwap",
                decimals: 18,
            },
            balance: "3319875635043330645",
            convertedBalance: 14.4,
            percent: 0.2,
        },
    ],
};
