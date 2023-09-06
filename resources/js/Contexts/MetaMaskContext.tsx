import axios, { type AxiosError } from "axios";
import get from "lodash/get";
import { createContext, useContext } from "react";
import useMetaMask, { type MetaMaskState } from "@/Hooks/useMetaMask";

const MetaMaskContext = createContext<MetaMaskState | undefined>(undefined);

interface Properties {
    children: React.ReactNode;
    initialAuth: App.Data.AuthData;
}

const MetaMaskContextProvider = ({ children, initialAuth }: Properties): JSX.Element => {
    const metaMaskState = useMetaMask({ initialAuth });

    axios.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const status = get(error, "response.status");

            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
            const message: string = get(error, "response.data.message", "");

            if (status === 403 && message === "signature_required") {
                metaMaskState.askForSignature();
            }

            return await Promise.reject(error);
        },
    );

    return <MetaMaskContext.Provider value={metaMaskState}>{children}</MetaMaskContext.Provider>;
};

export const useMetaMaskContext = (): MetaMaskState => {
    const context = useContext(MetaMaskContext);

    if (context === undefined) {
        throw new Error("useMetaMaskContext must be within MetaMaskContext.Provider");
    }

    return context;
};

export default MetaMaskContextProvider;
