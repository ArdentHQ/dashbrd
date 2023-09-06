import React from "react";
import { Navbar } from "@/Components/Layout/Navbar";
import * as useAuth from "@/Hooks/useAuth";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { useTransactionSliderContextSpy } from "@/Tests/Spies/useTransactionSliderContextSpy";
import { render, screen, userEvent } from "@/Tests/testing-library";

const user = new UserDataFactory().create();

const wallet = new WalletFactory().create();

describe("Navbar", () => {
    useTransactionSliderContextSpy();

    it("should render", () => {
        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user,
            wallet,
            authenticated: true,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });

        render(
            <Navbar
                authenticated
                connecting
                initialized
                user={user}
                wallet={wallet}
                connectWallet={vi.fn()}
            />,
        );

        expect(screen.getByTestId("Navbar")).toBeInTheDocument();
    });

    it("should render as unauthenticated", async () => {
        const connectMock = vi.fn();

        render(
            <Navbar
                authenticated={false}
                connecting={false}
                initialized
                wallet={null}
                connectWallet={connectMock}
            />,
        );

        expect(screen.getByTestId("Navbar__connect")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Connect Wallet" }));

        expect(connectMock).toHaveBeenCalled();
    });
});
