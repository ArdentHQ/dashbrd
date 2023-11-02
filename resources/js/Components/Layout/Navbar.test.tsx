import React from "react";
import { Navbar } from "@/Components/Layout/Navbar";
import DarkModeContextProvider from "@/Contexts/DarkModeContext";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { useTransactionSliderContextSpy } from "@/Tests/Spies/useTransactionSliderContextSpy";
import { mockAuthContext, render, screen, userEvent } from "@/Tests/testing-library";
const user = new UserDataFactory().create();

const wallet = new WalletFactory().create();

describe("Navbar", () => {
    useTransactionSliderContextSpy();

    it("should render", () => {
        const resetMock = mockAuthContext({ user, wallet });

        render(
            <DarkModeContextProvider>
                <Navbar
                    authenticated
                    connecting
                    initialized
                    user={user}
                    wallet={wallet}
                    connectWallet={vi.fn()}
                    onLogout={vi.fn()}
                />
            </DarkModeContextProvider>,
        );

        expect(screen.getByTestId("Navbar")).toBeInTheDocument();

        resetMock();
    });

    it("should render as unauthenticated", async () => {
        const connectMock = vi.fn();

        render(
            <DarkModeContextProvider>
                <Navbar
                    authenticated={false}
                    connecting={false}
                    initialized
                    wallet={null}
                    connectWallet={connectMock}
                    onLogout={vi.fn()}
                />
            </DarkModeContextProvider>,
        );

        expect(screen.getByTestId("Navbar__connect")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Connect Wallet" }));

        expect(connectMock).toHaveBeenCalled();
    });

    it("shows dark mode toggle if dark mode is enabled", () => {
        const connectMock = vi.fn();

        localStorage.setItem("theme", "dark");

        render(
            <DarkModeContextProvider>
                <Navbar
                    authenticated={false}
                    connecting={false}
                    initialized
                    wallet={null}
                    connectWallet={connectMock}
                    onLogout={vi.fn()}
                />
            </DarkModeContextProvider>,
        );

        for (const element of screen.getAllByTestId("Navbar__darkMode__dark")) {
            expect(element).toBeInTheDocument();
        }

        localStorage.removeItem("theme");

        render(
            <DarkModeContextProvider>
                <Navbar
                    authenticated={false}
                    connecting={false}
                    initialized
                    wallet={null}
                    connectWallet={connectMock}
                    onLogout={vi.fn()}
                />
            </DarkModeContextProvider>,
        );

        for (const element of screen.getAllByTestId("Navbar__darkMode__light")) {
            expect(element).toBeInTheDocument();
        }
    });
});
