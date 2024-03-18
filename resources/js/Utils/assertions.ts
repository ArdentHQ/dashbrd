import { AssertionError } from "assert";

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function assertUser(user?: App.Data.UserData | null): asserts user is App.Data.UserData {
    if (user === null || user === undefined) {
        throw new AssertionError({
            message: `Expected 'user' to be App.Data.UserData, but received ${String(user)}`,
        });
    }
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function assertWallet(wallet?: App.Data.Wallet.WalletData | null): asserts wallet is App.Data.Wallet.WalletData {
    if (wallet === undefined || wallet === null) {
        throw new AssertionError({
            message: `Expected 'wallet' to be App.Data.Wallet.WalletData, but received ${String(wallet)}`,
        });
    }
}
