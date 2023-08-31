import { DashboardHeader } from "@/Components/DashboardHeader";
import { BalanceHeader } from "@/Components/BalanceHeader";
import { SliderContext } from "@/Components/Slider";
import { type PortfolioAsset } from "@/Components/PortfolioBreakdown/PortfolioBreakdown.contracts";
import type { StoryFn, Meta } from "@storybook/react";
import EnvironmentContextProvider from "@/Contexts/EnvironmentContext";

export default {
    title: "Base/DashboardHeader",
    component: BalanceHeader,
    argTypes: {
        balance: {
            control: "number",
            defaultValue: 34253.75,
        },
        address: {
            control: "text",
            defaultValue: "0xF2A6cB05452DC9f3D2FE79815f7Ef4DE2977265d",
        },
        currency: {
            control: "radio",
            options: ["USD", "EUR", "GBP"],
            defaultValue: "USD",
        },
        tokens: {
            control: {
                type: "range",
                min: 1,
                max: 20,
            },
            defaultValue: 1,
        },
        assets: {
            defaultValue: [],
            table: {
                disable: true,
            },
        },
    },
} as Meta<typeof BalanceHeader>;

export const Default = {
    render: (args) => {
        return (
            <EnvironmentContextProvider
                environment="storybook"
                features={{ collections: true, galleries: true, portfolio: true }}
            >
                <DashboardHeader />
            </EnvironmentContextProvider>
        );
    },
};

export const WithBalanceHeader = {
    args: {
        balance: 34253.75,
        address: "0xF2A6cB05452DC9f3D2FE79815f7Ef4DE2977265d",
        tokens: 1,
        assets: [],
    },
    render: (args) => {
        const assetCount = args.tokens || 0;
        const assets = Array.from({ length: assetCount }).fill({
            token: {
                name: "BRDY TOKEN",
                symbol: "BRDY",
                decimals: 18,
                address: "",
                isNativeToken: true,
                images: {
                    thumb: null,
                    small: null,
                    large: null,
                },
                marketCap: 0,
                volume: 0,
            },
            balance: "0",
            percent: 1 / assetCount,
            convertedBalance: 0,
        }) as PortfolioAsset[];

        return (
            <div className="space-y-4">
                <EnvironmentContextProvider
                    environment="storybook"
                    features={{ collections: true, galleries: true, portfolio: true }}
                >
                    <SliderContext.Provider value={{ isOpen: false, setOpen: () => {} }}>
                        <DashboardHeader />
                        <BalanceHeader
                            {...args}
                            assets={assets}
                        />
                    </SliderContext.Provider>
                </EnvironmentContextProvider>
            </div>
        );
    },
};
