import { createContext, useContext, useEffect, useState } from "react";

interface ContextProperties {
    isDark: boolean;
    toggleDarkMode: () => void;
}

interface ProviderProperties {
    children: React.ReactNode;
}

const DarkModeContext = createContext<ContextProperties | undefined>(undefined);

export const DarkModeContextProvider = ({ children }: ProviderProperties): JSX.Element => {
    const [isDark, setIsDark] = useState<boolean>(false);

    const enableDarkMode = (): void => {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        setIsDark(true);
    };

    const disableDarkMode = (): void => {
        document.documentElement.classList.remove("dark");
        localStorage.removeItem("theme");
        setIsDark(false);
    };

    useEffect(() => {
        if (localStorage.theme === "dark") {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    }, []);

    const toggleDarkMode = (): void => {
        isDark ? disableDarkMode() : enableDarkMode();
    };

    return <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>{children}</DarkModeContext.Provider>;
};

export const useDarkModeContext = (): ContextProperties => {
    const context = useContext(DarkModeContext);

    if (context === undefined) {
        throw new Error("useDarkModeContext must be within DarkModeContextProvider");
    }

    return context;
};

export default DarkModeContextProvider;
