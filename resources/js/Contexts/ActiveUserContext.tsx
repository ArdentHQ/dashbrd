import { createContext, useContext, useState } from "react";

interface ContextProperties {
    user?: App.Data.UserData | null;
    wallet?: App.Data.Wallet.WalletData | null;
    authenticated?: boolean;
    setAuthData?: (data?: App.Data.AuthData) => void;
}

interface ProviderProperties extends ContextProperties {
    children: React.ReactNode;
    initialAuth?: App.Data.AuthData;
}

const ActiveUserContext = createContext<ContextProperties>({});

export const ActiveUserContextProvider = ({ children, initialAuth }: ProviderProperties): JSX.Element => {
    const [auth, setAuthData] = useState<App.Data.AuthData | undefined>(initialAuth);

    return (
        <ActiveUserContext.Provider
            value={{
                user: auth?.user,
                wallet: auth?.wallet,
                authenticated: auth?.authenticated,
                setAuthData,
            }}
        >
            {children}
        </ActiveUserContext.Provider>
    );
};
export const useActiveUser = (): ContextProperties => {
    const { user, wallet, authenticated, setAuthData } = useContext(ActiveUserContext);

    return {
        authenticated,
        user,
        wallet,
        setAuthData,
    };
};
