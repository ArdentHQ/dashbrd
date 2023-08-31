import type { Meta, StoryFn } from "@storybook/react";
import { PortfolioBreakdownTable } from "@/Components/PortfolioBreakdown";

export default {
    title: "Base/PortfolioBreakdown/Table",
    component: PortfolioBreakdownTable,
    argTypes: {
        assets: {
            table: {
                disable: true,
            },
        },
        currency: {
            control: "radio",
            options: ["USD", "EUR", "GBP"],
            defaultValue: "USD",
        },
    },
} as Meta<typeof PortfolioBreakdownTable>;

const assets = [
    {
        name: "USD Coin",
        symbol: "USDC",
        balance: "239000000000000000000",
        decimals: "6",
        fiat_balance: "239000000000000",
        percentage: "0.9999999941679489",
    },
    {
        name: "Wrapped Ether",
        symbol: "WETH",
        balance: "676000000000000000000",
        decimals: "18",
        fiat_balance: "1234903.28",
        percentage: "5.166959300409963e-09",
    },
    {
        name: "BNB",
        symbol: "BNB",
        balance: "408000000000000000000",
        decimals: "18",
        fiat_balance: "99576.48",
        percentage: "4.166379892019451e-10",
    },
    {
        name: "Compound",
        symbol: "COMP",
        balance: "868000000000000000000",
        decimals: "18",
        fiat_balance: "53824.68000000001",
        percentage: "2.2520786479536285e-10",
    },
    {
        name: "Balancer",
        symbol: "BAL",
        balance: "666000000000000000000",
        decimals: "18",
        fiat_balance: "2917.0800000000004",
        percentage: "1.2205355577353309e-11",
    },
];

const assetsWithOther = [
    ...assets.slice(0, -1),
    {
        name: "Chainlink, The Sandbox, Render, Basic Attention, Ethereum, Polygon, Ethereum, Polygon",
        symbol: "Other",
        balance: null,
        decimals: null,
        fiat_balance: "2638.708049503259",
        percentage: "1.1040619389599075e-11",
    },
];

const FullTemplate: StoryFn<typeof PortfolioBreakdownTable> = (args) => (
    <PortfolioBreakdownTable
        assets={assets}
        currency={args.currency}
    />
);

const WithOtherTemplate: StoryFn<typeof PortfolioBreakdownTable> = (args) => (
    <PortfolioBreakdownTable
        assets={assetsWithOther}
        currency={args.currency}
    />
);

export const Full = FullTemplate.bind({});
export const WithOther = WithOtherTemplate.bind({});
