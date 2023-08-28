import { isTruthy } from "@/Utils/is-truthy";

enum Interval {
    Long = 60 * 5 * 1000, // 5 minute,
    Short = 5 * 1000, // 5 seconds
    Regular = 30 * 1000, // 30 seconds
}

interface Properties {
    calculateInterval: (wallet?: App.Data.Wallet.WalletData | null, retries?: number) => number;
}

export const calculateInterval = (wallet?: App.Data.Wallet.WalletData | null, retries?: number): number => {
    if (wallet?.timestamps.tokens_fetched_at !== null && wallet?.timestamps.native_balances_fetched_at !== null) {
        return Interval.Long;
    }

    if (isTruthy(retries) && retries > 12) {
        return Interval.Regular;
    }

    return Interval.Short;
};

export const useWalletPollingInterval = (): Properties => ({ calculateInterval });
