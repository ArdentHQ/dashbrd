import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { assertUser, assertWallet } from "@/Utils/assertions";

describe("assertUser", () => {
    it("should pass with a user object", () => {
        const user = new UserDataFactory().create();

        expect(() => {
            assertUser(user);
        }).not.toThrow();
    });

    it("should fail without a user instance", () => {
        expect(() => {
            assertUser(undefined);
        }).toThrow("Expected 'user' to be App.Data.UserData, but received undefined");

        expect(() => {
            assertUser(null);
        }).toThrow("Expected 'user' to be App.Data.UserData, but received null");
    });
});

describe("assertWallet", () => {
    it("should pass with a user object", () => {
        const wallet = new WalletFactory().create();

        expect(() => {
            assertWallet(wallet);
        }).not.toThrow();
    });

    it("should fail without a wallet instance", () => {
        expect(() => {
            assertWallet(undefined);
        }).toThrow("Expected 'wallet' to be App.Data.Wallet.WalletData, but received undefined");

        expect(() => {
            assertWallet(null);
        }).toThrow("Expected 'wallet' to be App.Data.Wallet.WalletData, but received null");
    });
});
