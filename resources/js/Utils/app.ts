export const appName = (): string => {
    if (import.meta.env.VITE_APP_NAME === undefined) {
        return "Dashbrd";
    }

    return import.meta.env.VITE_APP_NAME as string;
};

export const appUrl = (): string => {
    if (import.meta.env.VITE_APP_URL === undefined) {
        return "http://dashbrd.test";
    }

    return import.meta.env.VITE_APP_URL as string;
};

export const polygonMainnetUrl = (): string => {
    if (import.meta.env.VITE_APP_NETWORK_FEES_API_ENDPOINT_POLYGON_MAINNET === undefined) {
        return "https://api.polygonscan.com/api";
    }

    return import.meta.env.VITE_APP_NETWORK_FEES_API_ENDPOINT_POLYGON_MAINNET as string;
};

export const ethereumMainnetUrl = (): string => {
    if (import.meta.env.VITE_APP_NETWORK_FEES_API_ENDPOINT_ETHEREUM_MAINNET === undefined) {
        return "https://api.etherscan.io/api";
    }

    return import.meta.env.VITE_APP_NETWORK_FEES_API_ENDPOINT_ETHEREUM_MAINNET as string;
};
