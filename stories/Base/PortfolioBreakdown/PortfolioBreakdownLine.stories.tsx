import type { Meta, StoryFn } from "@storybook/react";
import { PortfolioBreakdownLine, type PortfolioAsset } from "@/Components/PortfolioBreakdown";

export default {
    title: "Base/PortfolioBreakdown/Line",
    component: PortfolioBreakdownLine,
} as Meta<typeof PortfolioBreakdownLine>;

const assets: PortfolioAsset[] = [
    {
        token: {
            symbol: "AAVE",
            name: "Aave",
            decimals: 18,
        },
        balance: "76585573041076100000",
        convertedBalance: 8974.15,
        percent: 0.2609,
    },
    {
        token: {
            symbol: "ARK",
            name: "ARK",
            decimals: 18,
        },
        balance: "73136532604216200000",
        convertedBalance: 8646.64,
        percent: 0.3477,
    },
    {
        token: {
            symbol: "MATIC",
            name: "Polygon",
            decimals: 18,
        },
        balance: "19186364055222900000",
        convertedBalance: 6516.54,
        percent: 0.262,
    },
    {
        token: {
            symbol: "LINK",
            name: "Chainlink",
            decimals: 18,
        },
        balance: "4137353971075530000",
        convertedBalance: 641.64,
        percent: 0.0258,
    },
    {
        token: {
            symbol: "CRV",
            name: "Curve DAO Token",
            decimals: 18,
        },
        balance: "9924982055311020",
        convertedBalance: 68.42,
        percent: 0.0028,
    },
    {
        token: {
            symbol: "SUSHI",
            name: "SushiSwap",
            decimals: 18,
        },
        balance: "3319875635043330645",
        convertedBalance: 21.84,
        percent: 0.1009,
    },
];

const assetsWithOther = [
    ...assets.slice(0, -1),
    {
        token: {
            symbol: "Other",
            name: "SushiSwap, Uniswap",
        },
        balance: "0",
        convertedBalance: 21.84,
        percent: 0.1009,
    },
];

const FullTemplate: StoryFn<typeof PortfolioBreakdownLine> = () => <PortfolioBreakdownLine assets={assets} />;

const WithOtherTemplate: StoryFn<typeof PortfolioBreakdownLine> = () => (
    <PortfolioBreakdownLine assets={assetsWithOther} />
);

const EmptyTemplate: StoryFn<typeof PortfolioBreakdownLine> = () => <PortfolioBreakdownLine assets={[]} />;

export const Full = FullTemplate.bind({});
export const WithOther = WithOtherTemplate.bind({});
export const Empty = EmptyTemplate.bind({});
