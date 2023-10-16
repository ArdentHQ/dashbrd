import { createContext, type SetStateAction, useContext, useState } from "react";

type ContextProperties = App.Data.AuthData & {
    setAuthData: (data: SetStateAction<App.Data.AuthData>) => void;
    clearAuthData: () => void;
};

interface ProviderProperties {
    children: React.ReactNode;
    initialAuth: App.Data.AuthData;
}

const ActiveUserContext = createContext<ContextProperties | undefined>(undefined);

export const ActiveUserContextProvider = ({ children, initialAuth }: ProviderProperties): JSX.Element => {
    const [auth, setAuthData] = useState<App.Data.AuthData>(initialAuth);

    const clearAuthData = (): void => {
        setAuthData({
            user: null,
            wallet: null,
            authenticated: false,
            signed: false,
        });
    };

    return (
        <ActiveUserContext.Provider
            value={{
                ...auth,
                setAuthData,
                clearAuthData,
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
