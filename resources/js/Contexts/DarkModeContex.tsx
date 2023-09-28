import { createContext, useContext, useEffect, useState } from "react";

interface ContextProperties {
    isDark?: boolean;
    toggleDarkMode?: () => void;
}

interface ProviderProperties {
    children: React.ReactNode;
}

const DarkModeContext = createContext<ContextProperties | undefined>({});

export const DarkModeContextProvider = ({ children }: ProviderProperties): JSX.Element => {
    const [isDark, setIsDark] = useState<boolean>(false);

    const setDarkModeTrue = (): void => {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        setIsDark(true);
    };

    const setDarkModeFalse = (): void => {
        document.documentElement.classList.remove("dark");
        localStorage.removeItem("theme");
        setIsDark(false);
    };

    useEffect(() => {
        if (localStorage.theme === "dark") {
            setDarkModeTrue();
        } else {
            setDarkModeFalse();
        }
    }, []);

    const toggleDarkMode = (): void => {
        isDark ? setDarkModeFalse() : setDarkModeTrue();
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
