import { useWalletPollingInterval } from "./useWalletPollingIntervals";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { renderHook } from "@/Tests/testing-library";

describe("useWalletPollingInterval", () => {
    it("should return short interval if user is new", () => {
        const wallet = new WalletFactory().create({
            timestamps: {
                tokens_fetched_at: null,
                native_balances_fetched_at: null,
            },
        });

        const { result } = renderHook(() => useWalletPollingInterval(wallet));

        expect(result.current.calculateInterval(0)).toEqual(5000);
    });

    it("should return regular interval if user is new and has more than 12 retries", () => {
        const wallet = new WalletFactory().create({
            timestamps: {
                tokens_fetched_at: null,
                native_balances_fetched_at: null,
            },
        });

        const { result } = renderHook(() => useWalletPollingInterval(wallet));

        expect(result.current.calculateInterval(0)).toEqual(30000);
    });

    it("should return long interval if the wallet was recently active", () => {
        const wallet = new WalletFactory().create({
            timestamps: {
                tokens_fetched_at: new Date().getTime(),
                native_balances_fetched_at: new Date().getTime(),
            },
        });

        const { result } = renderHook(() => useWalletPollingInterval(wallet));

        expect(result.current.calculateInterval(0)).toEqual(300000);
    });
});
