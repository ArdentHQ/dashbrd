import { createContext, useContext, useEffect } from "react";
import { usePortfolioBreakdown } from "@/Components/PortfolioBreakdown";
import { useActiveUser } from "@/Contexts/ActiveUserContext";

export interface PortfolioBreakdownState {
    breakdownAssets: App.Data.TokenPortfolioData[];
    loadingBreakdown: boolean;
}

const PortfolioBreakdownContext = createContext<PortfolioBreakdownState | undefined>(undefined);

export const PortfolioBreakdownProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const { assets: breakdownAssets, loading: loadingBreakdown, loadBreakdown } = usePortfolioBreakdown();

    const { authenticated } = useActiveUser();

    useEffect(() => {
        if (authenticated === true) {
            void loadBreakdown();
        }
    }, [authenticated]);

    return (
        <PortfolioBreakdownContext.Provider
            data-testid="PortfolioBreakdownContext"
            value={{
                breakdownAssets,
                loadingBreakdown,
            }}
        >
            <>{children}</>
        </PortfolioBreakdownContext.Provider>
    );
};

export const usePortfolioBreakdownContext = (): PortfolioBreakdownState => {
    const context = useContext(PortfolioBreakdownContext);

    if (context === undefined) {
        throw new Error("usePortfolioBreakdownContext must be within PortfolioBreakdownState");
    }

    return context;
};
