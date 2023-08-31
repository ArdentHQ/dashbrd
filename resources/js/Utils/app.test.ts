import { appName, appUrl, ethereumMainnetUrl, polygonMainnetUrl } from "@/Utils/app";

describe("app", () => {
    it("#appName", () => {
        expect(appName()).toBe("Dashbrd");
        process.env.VITE_APP_NAME = "my app";
        expect(appName()).toBe("my app");
    });

    it("#appUrl", () => {
        expect(appUrl()).toBe("http://dashbrd.test");
        process.env.VITE_APP_URL = "my url";
        expect(appUrl()).toBe("my url");
    });

    it("#polygonMainnetUrl", () => {
        expect(polygonMainnetUrl()).toBe("https://api.polygonscan.com/api");
        process.env.VITE_APP_NETWORK_FEES_API_ENDPOINT_POLYGON_MAINNET = "my polygonMainnetUrl";
        expect(polygonMainnetUrl()).toBe("my polygonMainnetUrl");
    });

    it("#etheruemMainnetUrl", () => {
        expect(ethereumMainnetUrl()).toBe("https://api.etherscan.io/api");
        process.env.VITE_APP_NETWORK_FEES_API_ENDPOINT_ETHEREUM_MAINNET = "my ethereumMainnetUrl";
        expect(ethereumMainnetUrl()).toBe("my ethereumMainnetUrl");
    });
});
