import ziggyRoute from "ziggy-js";
import { AxiosInstance, AxiosRequestConfig } from "axios";
import { Ethereum } from "@/hooks/useMetaMask.contracts";

declare global {
    const route: typeof ziggyRoute;

    interface Window {
        axios: AxiosInstance;
        ethereum?: Ethereum;
        IS_REACT_ACT_ENVIRONMENT?: boolean;
        CC: CookieConsent;
        dataLayer: any;
    }
}

export {};
