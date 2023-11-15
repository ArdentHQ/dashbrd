import { createContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";
import { useToasts } from "@/Hooks/useToasts";

interface ContextProperties {
    children: React.ReactNode;
}

interface ProviderProperties {
    children: React.ReactNode;
}

const Erc1155Context = createContext<ContextProperties | undefined>(undefined);

export const Erc1155ContextProvider = ({ children }: ProviderProperties): JSX.Element => {
    const { wallet } = useAuth();

    const { showToast } = useToasts();
    const { t } = useTranslation();

    useEffect(() => {
        if ((wallet?.hasErc1155Nfts ?? false) && localStorage.getItem("hide-erc115-message") !== "true") {
            showToast({
                title: t("pages.nfts.erc1155_support.title"),
                message: t("pages.nfts.erc1155_support.description"),
                type: "warning",
                isExpanded: true,
                isStatic: true,
                onClose: () => {
                    localStorage.setItem("hide-erc115-message", "true");
                },
            });
        }
    }, []);

    return <Erc1155Context.Provider value={undefined}>{children}</Erc1155Context.Provider>;
};

export default Erc1155ContextProvider;
