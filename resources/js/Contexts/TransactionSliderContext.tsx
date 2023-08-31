import { createContext, useContext, useEffect, useState } from "react";
import TokenListItemData = App.Data.TokenListItemData;
import { useTokensList } from "@/Components/PortfolioBreakdown/Hooks/useTokensList";
import { type TransactionDirection, TransactionFormSlider } from "@/Components/TransactionFormSlider";
import { useActiveUser } from "@/Contexts/ActiveUserContext";
import {
    type Transaction,
    type TransactionRecord,
    useTransactionStatusMonitor,
} from "@/Hooks/useTransactionStatusMonitor";
import { isTruthy } from "@/Utils/is-truthy";

export interface TransactionSliderState {
    transactionSliderDirection?: TransactionDirection;
    setTransactionSliderDirection: (direction?: TransactionDirection) => void;
    transactionAsset?: TokenListItemData;
    setTransactionAsset: (asset?: TokenListItemData) => void;
    registerTransaction: (t: Transaction) => Promise<void>;
    lastTransaction?: TransactionRecord;
}

export const TransactionSliderContext = createContext<TransactionSliderState | undefined>(undefined);

export const useTransactionSliderContext = (): TransactionSliderState => {
    const context = useContext(TransactionSliderContext);

    if (context === undefined) {
        throw new Error("useTransactionSliderContext must be within TransactionSliderProvider");
    }

    return context;
};

export const TransactionSliderProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const [transactionSliderDirection, setTransactionSliderDirection] = useState<TransactionDirection | undefined>();

    const [transactionAsset, setTransactionAsset] = useState<App.Data.TokenListItemData | undefined>();

    const { tokens, loadTokens } = useTokensList();

    const { authenticated, wallet, user } = useActiveUser();

    const { registerTransaction, lastTransaction } = useTransactionStatusMonitor();

    useEffect(() => {
        if (authenticated === true) {
            void loadTokens();
        }
    }, [authenticated]);

    return (
        <TransactionSliderContext.Provider
            data-testid="TransactionSliderContext"
            value={{
                registerTransaction,
                transactionAsset,
                setTransactionAsset,
                lastTransaction,
                transactionSliderDirection,
                setTransactionSliderDirection,
            }}
        >
            <>
                {children}
                {isTruthy(user) && isTruthy(wallet) && (
                    <TransactionFormSlider
                        user={user}
                        isOpen={transactionSliderDirection !== undefined}
                        balance={Number(wallet.totalBalanceInCurrency)}
                        asset={transactionAsset}
                        currency={user.attributes.currency}
                        assets={tokens}
                        wallet={wallet}
                        direction={transactionSliderDirection}
                        onClose={() => {
                            setTransactionSliderDirection(undefined);
                        }}
                    />
                )}
            </>
        </TransactionSliderContext.Provider>
    );
};
