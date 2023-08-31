import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TokenTransactionDetailsSlider } from "./TokenTransactionDetailsSlider";
import { ExplorerButton, TokenTransactionsTable } from "./TokenTransactions.blocks";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { Toast } from "@/Components/Toast";
import { useTransactionSliderContext } from "@/Contexts/TransactionSliderContext";
import { useExplorer } from "@/Hooks/useExplorer";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";
import { isTruthy } from "@/Utils/is-truthy";

export const TokenTransactions = ({
    asset,
    user,
    wallet,
}: {
    asset: App.Data.TokenListItemData;
    user: App.Data.UserData;
    wallet?: App.Data.Wallet.WalletData | null;
}): JSX.Element => {
    const { t } = useTranslation();
    const { transactions, isLoading, hasMore, fetchTransactions, error } = useExplorer({
        chainId: asset.chain_id,
    });
    const [selectedTransaction, setSelectedTransaction] = useState<App.Data.TransactionData | undefined>(undefined);

    const { lastTransaction } = useTransactionSliderContext();

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (!isTruthy(wallet)) {
            return;
        }

        if (!isFirstRender && lastTransaction?.address !== asset.address) {
            return;
        }

        void fetchTransactions(wallet.address, asset);
    }, [isFirstRender, lastTransaction]);

    if (!isLoading && isTruthy(error)) {
        return (
            <div>
                <Toast
                    type="warning"
                    isExpanded
                    isStatic
                    message={error}
                    data-testid="TokenTransactions__error"
                />

                <div className="flex items-center justify-center">
                    <ExplorerButton
                        chainId={asset.chain_id}
                        address={wallet?.address}
                        tokenAddress={asset.address}
                    />
                </div>
            </div>
        );
    }

    return (
        <div data-testid="TokenTransactions">
            {!isLoading && transactions.length === 0 && <EmptyBlock>{t("common.empty_transactions")}</EmptyBlock>}

            {(isLoading || transactions.length > 0) && (
                <TokenTransactionsTable
                    isLoading={isLoading}
                    transactions={transactions}
                    user={user}
                    asset={asset}
                    onRowClick={setSelectedTransaction}
                />
            )}

            {!isLoading && hasMore && (
                <div className="flex items-center justify-center">
                    <ExplorerButton
                        chainId={asset.chain_id}
                        address={wallet?.address}
                        tokenAddress={asset.address}
                    />
                </div>
            )}

            <TokenTransactionDetailsSlider
                data-testid="TransactionDetailSlider"
                isOpen={isTruthy(selectedTransaction)}
                user={user}
                transaction={selectedTransaction}
                asset={asset}
                onClose={() => {
                    setSelectedTransaction(undefined);
                }}
            />
        </div>
    );
};
