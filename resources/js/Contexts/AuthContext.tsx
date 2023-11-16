import { router } from "@inertiajs/react";
import axios from "axios";
import { createContext, type SetStateAction, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToasts } from "@/Hooks/useToasts";

type ContextProperties = App.Data.AuthData & {
    setAuthData: (data: SetStateAction<App.Data.AuthData>) => void;
    logout: () => Promise<void>;
};

interface ProviderProperties {
    children: React.ReactNode;
    initialAuth: App.Data.AuthData;
}

const AuthContext = createContext<ContextProperties | undefined>(undefined);

export const AuthContextProvider = ({ children, initialAuth }: ProviderProperties): JSX.Element => {
    const { showToast, clear } = useToasts();
    const { t } = useTranslation();

    const [auth, setAuthData] = useState<App.Data.AuthData>(initialAuth);

    router.on("navigate", (event) => {
        setAuthData(event.detail.page.props.auth);
    });

    const logout = async (): Promise<void> => {
        const response = await axios.post<{ redirectTo: string | null }>(route("logout"));

        setAuthData({
            user: null,
            wallet: null,
            authenticated: false,
            signed: false,
        });

        const redirectTo = response.data.redirectTo;
        redirectTo === null ? router.reload() : router.get(route(redirectTo));
    };

    useEffect(() => {
        if ((auth.wallet?.hasErc1155Nfts ?? false) && localStorage.getItem("hide-erc115-message") !== "true") {
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

    useEffect(() => {
        if (auth.wallet === null) {
            clear();
        }
    }, [auth]);

    return (
        <AuthContext.Provider
            value={{
                ...auth,
                setAuthData,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): ContextProperties => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within a AuthContextProvider");
    }

    return context;
};
