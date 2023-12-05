import { createContext, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";
import useMetaMask, { type MetaMaskState } from "@/Hooks/useMetaMask";
import { useToasts } from "@/Hooks/useToasts";

const MetaMaskContext = createContext<MetaMaskState | undefined>(undefined);

interface Properties {
    children: React.ReactNode;
}

const MetaMaskContextProvider = ({ children }: Properties): JSX.Element => {
    const { showToast, clear } = useToasts();
    const { t } = useTranslation();

    const { wallet } = useAuth();

    const metaMaskState = useMetaMask();
    const chain = metaMaskState.chainId === 1 ? "eth" : "polygon";

    useEffect(() => {
        if (
            (wallet?.hasErc1155Nfts[chain] ?? false) &&
            localStorage.getItem("hide-erc115-message:" + wallet?.address + ":" + chain) !== "true"
        ) {
            showToast({
                title: t("pages.nfts.erc1155_support.title"),
                message: t("pages.nfts.erc1155_support.description"),
                type: "warning",
                isExpanded: true,
                isStatic: true,
                onClose: () => {
                    localStorage.setItem("hide-erc115-message:" + wallet?.address + ":" + chain, "true");
                },
            });
        }
    }, []);

    useEffect(() => {
        if (wallet === null) {
            clear();
        }
    }, [wallet, metaMaskState.chainId]);

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
