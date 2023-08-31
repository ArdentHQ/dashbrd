import { createContext, useContext } from "react";
import { type Features } from "@/Types/app";

interface Properties {
    children: React.ReactNode;
    environment: string;
    features: Features;
}

interface ContextProperties extends Omit<Properties, "children"> {
    isLocal: boolean;
}

const EnvironmentContext = createContext<ContextProperties | undefined>(undefined);

const EnvironmentContextProvider = ({ children, environment, features }: Properties): JSX.Element => {
    const isLocal = environment === "local";

    return (
        <EnvironmentContext.Provider value={{ environment, isLocal, features }}>{children}</EnvironmentContext.Provider>
    );
};

export const useEnvironmentContext = (): ContextProperties => {
    const context = useContext(EnvironmentContext);

    if (context === undefined) {
        throw new Error("useEnvironmentContext must be within EnvironmentContext.Provider");
    }

    return context;
};

export default EnvironmentContextProvider;
