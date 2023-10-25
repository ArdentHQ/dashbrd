import { createContext, useContext } from "react";
import useMetaMask, { type MetaMaskState } from "@/Hooks/useMetaMask";

const MetaMaskContext = createContext<MetaMaskState | undefined>(undefined);

interface Properties {
    children: React.ReactNode;
}

const MetaMaskContextProvider = ({ children }: Properties): JSX.Element => {
    const metaMaskState = useMetaMask();

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
