import type { Meta, StoryFn } from "@storybook/react";
import { UserDetails as Component } from "@/Components/Navbar/UserDetails";
import EnvironmentContextProvider from "@/Contexts/EnvironmentContext";

export default {
    title: "Base/Navbar",
    component: Component,
} as Meta<typeof Component>;

const wallet: App.Data.WalletData = {
    address: "0x1234567890123456789012345678901234567890",
    domain: null,
    avatar: {
        default: null,
        small: null,
        small2x: null,
    },
    totalUsd: 0,
    balances: [],
    nftCount: 0,
    nfts: [],
    galleryCount: 0,
    collectionCount: 0,
};

export const UserDetails = {
    args: {
        nfts: [],
        nftCount: 0,
        collectionCount: 0,
        galleriesCount: 0,
        collectionsValue: 0,
        user: {
            balances: [
                {
                    token: {
                        address: "",
                        network: wallet.network,
                        isNativeToken: true,
                        isDefaultToken: true,
                        name: "Polygon",
                        symbol: "MATIC",
                        decimals: 18,
                        images: {
                            thumb: null,
                            small: null,
                            large: null,
                        },
                        marketCap: 0,
                        volume: 0,
                    },
                    balance: "200000000000000000",
                    timestamp: 1,
                },
                {
                    token: {
                        address: "",
                        network: wallet.network,
                        isNativeToken: true,
                        isDefaultToken: true,
                        name: "USD Coin",
                        symbol: "USDC",
                        decimals: 18,
                        images: {
                            thumb: null,
                            small: null,
                            large: null,
                        },
                        marketCap: 0,
                        volume: 0,
                    },
                    balance: "10000000000000000",
                    timestamp: 1,
                },
            ],
            attributes: {
                currency: "USD",
                date_format: "",
                time_format: "24",
                timezone: "UTC",
            },
            totals: {
                USD: 1234512,
            },
        },
        wallet,
    },
    render: (args) => (
        <EnvironmentContextProvider
            environment="storybook"
            features={{ collections: true, galleries: true, portfolio: true }}
        >
            <div className="relative flex justify-end">
                <Component {...args} />
            </div>
        </EnvironmentContextProvider>
    ),
};

const dummyNft = {
    id: 123,
    name: "",
    tokenNumber: "",
    collection: {},
    images: {
        thumb: "https://example.com",
    },
};

export const UserDetailsManyNfts = {
    args: {
        nfts: [dummyNft, dummyNft, dummyNft, dummyNft, dummyNft],
        nftCount: 100,
        collectionCount: 10,
        galleriesCount: 10,
        collectionsValue: 0,
        user: {
            balances: [
                {
                    token: {
                        address: "",
                        network: wallet.network,
                        isNativeToken: true,
                        isDefaultToken: true,
                        name: "Polygon",
                        symbol: "MATIC",
                        decimals: 18,
                        images: {
                            thumb: null,
                            small: null,
                            large: null,
                        },
                        marketCap: 0,
                        volume: 0,
                    },
                    balance: "200000000000000000",
                    timestamp: 1,
                },
                {
                    token: {
                        address: "",
                        network: wallet.network,
                        isNativeToken: true,
                        isDefaultToken: true,
                        name: "USD Coin",
                        symbol: "USDC",
                        decimals: 18,
                        images: {
                            thumb: null,
                            small: null,
                            large: null,
                        },
                        marketCap: 0,
                        volume: 0,
                    },
                    balance: "10000000000000000",
                    timestamp: 1,
                },
            ],
            attributes: {
                currency: "USD",
                date_format: "",
                time_format: "24",
                timezone: "UTC",
            },
            totals: {
                USD: 1234512,
            },
        },
        wallet,
    },
    render: (args) => (
        <EnvironmentContextProvider
            environment="storybook"
            features={{ collections: true, galleries: true, portfolio: true }}
        >
            <div className="relative flex justify-end">
                <Component {...args} />
            </div>
        </EnvironmentContextProvider>
    ),
};

export const UserDetailsOneNft = {
    args: {
        nfts: [dummyNft],
        nftCount: 1,
        collectionCount: 10,
        galleriesCount: 10,
        collectionsValue: 0,
        user: {
            balances: [
                {
                    token: {
                        address: "",
                        network: wallet.network,
                        isNativeToken: true,
                        isDefaultToken: true,
                        name: "Polygon",
                        symbol: "MATIC",
                        decimals: 18,
                        images: {
                            thumb: null,
                            small: null,
                            large: null,
                        },
                        marketCap: 0,
                        volume: 0,
                    },
                    balance: "200000000000000000",
                    timestamp: 1,
                },
                {
                    token: {
                        address: "",
                        network: wallet.network,
                        isNativeToken: true,
                        isDefaultToken: true,
                        name: "USD Coin",
                        symbol: "USDC",
                        decimals: 18,
                        images: {
                            thumb: null,
                            small: null,
                            large: null,
                        },
                        marketCap: 0,
                        volume: 0,
                    },
                    balance: "10000000000000000",
                    timestamp: 1,
                },
            ],
            attributes: {
                currency: "USD",
                date_format: "",
                time_format: "24",
                timezone: "UTC",
            },
            totals: {
                USD: 1234512,
            },
        },
        wallet,
    },
    render: (args) => (
        <EnvironmentContextProvider
            environment="storybook"
            features={{ collections: true, galleries: true, portfolio: true }}
        >
            <div className="relative flex justify-end">
                <Component {...args} />
            </div>
        </EnvironmentContextProvider>
    ),
};

export const UserDetailsFewNfts = {
    args: {
        nfts: [dummyNft, dummyNft, dummyNft],
        nftCount: 3,
        collectionCount: 10,
        galleriesCount: 10,
        collectionsValue: 0,
        user: {
            balances: [
                {
                    token: {
                        address: "",
                        network: wallet.network,
                        isNativeToken: true,
                        isDefaultToken: true,
                        name: "Polygon",
                        symbol: "MATIC",
                        decimals: 18,
                        images: {
                            thumb: null,
                            small: null,
                            large: null,
                        },
                        marketCap: 0,
                        volume: 0,
                    },
                    balance: "200000000000000000",
                    timestamp: 1,
                },
                {
                    token: {
                        address: "",
                        network: wallet.network,
                        isNativeToken: true,
                        isDefaultToken: true,
                        name: "USD Coin",
                        symbol: "USDC",
                        decimals: 18,
                        images: {
                            thumb: null,
                            small: null,
                            large: null,
                        },
                        marketCap: 0,
                        volume: 0,
                    },
                    balance: "10000000000000000",
                    timestamp: 1,
                },
            ],
            attributes: {
                currency: "USD",
                date_format: "",
                time_format: "24",
                timezone: "UTC",
            },
            totals: {
                USD: 1234512,
            },
        },
        wallet,
    },
    render: (args) => (
        <EnvironmentContextProvider
            environment="storybook"
            features={{ collections: true, galleries: true, portfolio: true }}
        >
            <div className="relative flex justify-end">
                <Component {...args} />
            </div>
        </EnvironmentContextProvider>
    ),
};
