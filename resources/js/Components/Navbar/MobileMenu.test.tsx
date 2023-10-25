import { within } from "@testing-library/react";
import React from "react";
import { expect, type SpyInstance } from "vitest";
import { MobileMenu, NavLink } from "@/Components/Navbar/MobileMenu";
import { TransactionDirection } from "@/Components/TransactionFormSlider";
import * as environmentContextMock from "@/Contexts/EnvironmentContext";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { useTransactionSliderContextSpy } from "@/Tests/Spies/useTransactionSliderContextSpy";
import { render, screen, userEvent } from "@/Tests/testing-library";

const environmentDefault = {
    environment: "local",
    isLocal: true,
    features: {
        collections: true,
        galleries: true,
        portfolio: true,
    },
};

let environmentSpy: SpyInstance;

const wallet = new WalletFactory().create();

const properties = {
    wallet,
    isConnectButtonDisabled: false,
    connectWallet: vi.fn(),
    onLogout: vi.fn(),
    currency: "USD",
};

const openMobileMenu = async (): Promise<void> => {
    await userEvent.click(screen.getByTestId("MobileMenu__Trigger"));
};

describe("MobileMenu", () => {
    const { setTransactionSliderDirection } = useTransactionSliderContextSpy();

    beforeEach(() => {
        environmentSpy = vi.spyOn(environmentContextMock, "useEnvironmentContext").mockReturnValue(environmentDefault);
    });

    afterEach(() => {
        environmentSpy.mockRestore();
    });

    it.each([
        ["TokenActions__send", TransactionDirection.Send],
        ["TokenActions__receive", TransactionDirection.Receive],
    ])("should open transaction slider when token actions clicked", async (button, direction) => {
        render(<MobileMenu {...properties} />);

        await openMobileMenu();

        const buttonParent = within(screen.getByTestId(button));

        await userEvent.click(buttonParent.getByTestId("IconButton"));
        expect(setTransactionSliderDirection).toHaveBeenCalledWith(direction);
    });

    it("should be able close the menu", async () => {
        render(<MobileMenu {...properties} />);

        await openMobileMenu();

        expect(screen.getByTestId("MobileMenu__Content")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Slider__overlay"));

        expect(screen.queryByTestId("MobileMenu__Content")).not.toBeInTheDocument();
    });

    it("should show connect button if user not authenticated", async () => {
        render(<MobileMenu {...{ ...properties, wallet: null }} />);

        await openMobileMenu();

        expect(screen.getByTestId("MobileMenu__ConnectButton")).toBeInTheDocument();
    });

    it("should trigger MetaMask when connect button clicked", async () => {
        const connectMock = vi.fn();
        render(<MobileMenu {...{ ...properties, wallet: null, connectWallet: connectMock }} />);

        await openMobileMenu();

        await userEvent.click(screen.getByTestId("MobileMenu__ConnectButton"));
        expect(connectMock).toHaveBeenCalledOnce();
    });

    it("should show whole menu links and hide connect button if user authenticated", async () => {
        render(<MobileMenu {...properties} />);

        await openMobileMenu();

        expect(screen.getByTestId("MobileMenu__MainContent")).toBeInTheDocument();
        expect(screen.queryByTestId("MobileMenu__ConnectButton")).not.toBeInTheDocument();
    });
});

describe("NavLink", () => {
    it.each([
        [true, "text-theme-secondary-900"],
        [false, "text-theme-secondary-700"],
        [undefined, "text-theme-secondary-700"],
    ])("should render nav link in a different color based on the active flag", (isActive, className) => {
        render(
            <NavLink
                href="/"
                icon="Grid"
                active={isActive}
                label="Nice label"
            />,
        );

        expect(screen.getByTestId("MobileMenu__NavLink")).toHaveClass(className);
    });
});
