import { router } from "@inertiajs/react";
import axios from "axios";
import { createContext, type SetStateAction, useContext, useState } from "react";

type ContextProperties = App.Data.AuthData & {
    setAuthData: (data: SetStateAction<App.Data.AuthData>) => void;
    logout: () => Promise<void>;
};

interface ProviderProperties {
    children: React.ReactNode;
    initialAuth: App.Data.AuthData;
}

const ActiveUserContext = createContext<ContextProperties | undefined>(undefined);

export const ActiveUserContextProvider = ({ children, initialAuth }: ProviderProperties): JSX.Element => {
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

    return (
        <ActiveUserContext.Provider
            value={{
                ...auth,
                setAuthData,
                logout,
            }}
        >
            {children}
        </ActiveUserContext.Provider>
    );
};

export const useActiveUser = (): ContextProperties => {
    const context = useContext(ActiveUserContext);

    if (context === undefined) {
        throw new Error("useActiveUser must be used within a ActiveUserContextProvider");
    }

    return context;
};
