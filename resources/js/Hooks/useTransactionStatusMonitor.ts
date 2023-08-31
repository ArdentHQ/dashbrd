import axios from "axios";
import { useState } from "react";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { purgeCacheByAddress } from "@/Utils/Explorer/explorer.transactions.service";
import { sleep } from "@/Utils/sleep";

export interface Transaction {
    asset: App.Data.TokenListItemData;
    hash: string;
}

export interface TransactionRecord {
    hash: string;
    address: string;
}

export interface TransactionStatusMonitor {
    lastTransaction?: TransactionRecord;
    registerTransaction: (t: Transaction) => Promise<void>;
}

const triggerBalanceRefresh = async (chainId: number): Promise<void> => {
    await axios.post(
        route("transaction-success", {
            chainId,
        }),
    );
};

export const useTransactionStatusMonitor = (): TransactionStatusMonitor => {
    const [lastTransaction, setLastTransaction] = useState<TransactionRecord>();

    const { getTransactionReceipt } = useMetaMaskContext();

    const registerTransaction = async (transaction: Transaction): Promise<void> => {
        await getTransactionReceipt(transaction.hash);

        const { address, chain_id: chainId, is_native_token: isNativeToken } = transaction.asset;

        void triggerBalanceRefresh(chainId);

        // this is to ensure that explorer API (etherscan/polygonscan) has the latest transaction
        await sleep(6000);

        purgeCacheByAddress(address, isNativeToken);

        setLastTransaction({
            address,
            hash: transaction.hash,
        });
    };

    return { registerTransaction, lastTransaction };
};
