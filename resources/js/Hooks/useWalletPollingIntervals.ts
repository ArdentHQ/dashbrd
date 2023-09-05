import { DateTime } from "@ardenthq/sdk-intl";
import { LocalStorageKey, useLocalStorage } from "./useLocalStorage";
import { isTruthy } from "@/Utils/is-truthy";

export enum Interval {
    Long = 60 * 5 * 1000, // 5 minute,
    Short = 5 * 1000, // 5 seconds
    Regular = 30 * 1000, // 30 seconds
}

interface CalculateIntervalProperties {
    wallet?: App.Data.Wallet.WalletData | null;
    lastTransactionSentAt?: number | null;
    retries?: number;
}

interface Properties {
    calculateInterval: (retries?: number) => number;
}

export const calculateInterval = ({ wallet, retries, lastTransactionSentAt }: CalculateIntervalProperties): number => {
    if (
        isTruthy(lastTransactionSentAt) &&
        DateTime.make(lastTransactionSentAt).addMinutes(1).isBefore(DateTime.make())
    ) {
        return Interval.Short;
    }

    if (wallet?.timestamps.tokens_fetched_at !== null && wallet?.timestamps.native_balances_fetched_at !== null) {
        return Interval.Long;
    }

    if (isTruthy(retries) && retries > 12) {
        return Interval.Regular;
    }

    return Interval.Short;
};

export const useWalletPollingInterval = (wallet?: App.Data.Wallet.WalletData | null): Properties => {
    const [lastTransactionSentAt] = useLocalStorage<number | null>(LocalStorageKey.LastTransactionSentAt);

    return {
        calculateInterval: (retries?: number) => calculateInterval({ wallet, retries, lastTransactionSentAt }),
    };
};
