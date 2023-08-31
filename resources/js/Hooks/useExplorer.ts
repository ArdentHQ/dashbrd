import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Explorer } from "@/Utils/Explorer";

export const useExplorer = ({
    chainId,
}: {
    chainId: number;
}): {
    transactions: App.Data.TransactionData[];
    isLoading: boolean;
    fetchTransactions: (address: string, asset?: App.Data.TokenListItemData) => Promise<void>;
    hasMore: boolean;
    error?: string;
} => {
    const [transactions, setTransactions] = useState<App.Data.TransactionData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const { t } = useTranslation();

    const explorer = new Explorer(chainId);

    const fetchTransactions = async (address: string, asset?: App.Data.TokenListItemData): Promise<void> => {
        setIsLoading(true);
        setError(undefined);

        try {
            setTransactions(await explorer.transactionsByAddress(address, asset));
        } catch (error) {
            setError(t("pages.token_panel.failed_to_retrieve_transactions"));
        }

        setIsLoading(false);
    };

    return {
        transactions: transactions.slice(0, 10),
        isLoading,
        fetchTransactions,
        hasMore: transactions.length > 10,
        error,
    };
};
