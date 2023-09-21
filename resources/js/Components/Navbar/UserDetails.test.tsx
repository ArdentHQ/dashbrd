import { router } from "@inertiajs/react";
import { within } from "@testing-library/react";
import React from "react";
import { type SpyInstance } from "vitest";
import { UserDetails } from "@/Components/Navbar/UserDetails";
import { TransactionDirection } from "@/Components/TransactionFormSlider";
import * as environmentContextMock from "@/Contexts/EnvironmentContext";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
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
let useAuthorizedActionSpy: SpyInstance;

const signedActionMock = vi.fn();

const wallet = new WalletFactory().create();

describe("UserDetails", () => {
    const { setTransactionSliderDirection } = useTransactionSliderContextSpy();

    beforeEach(() => {
        environmentSpy = vi.spyOn(environmentContextMock, "useEnvironmentContext").mockReturnValue(environmentDefault);

        useAuthorizedActionSpy = vi.spyOn(useAuthorizedActionMock, "useAuthorizedAction").mockReturnValue({
            signedAction: signedActionMock,
        });
    });

    afterEach(() => {
        environmentSpy.mockRestore();

        useAuthorizedActionSpy.mockRestore();

        signedActionMock.mockReset();
    });

    it("should render", async () => {
        const wallet = new WalletFactory().withoutAvatar().create();

        render(
            <UserDetails
                wallet={wallet}
                galleriesCount={0}
                collectionCount={0}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("UserDetails__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("UserDetails__trigger"));

        expect(screen.getByTestId("AccountNavigation__galleries")).toBeInTheDocument();
        expect(screen.getByTestId("AccountNavigation__collections")).toBeInTheDocument();
    });

    it("should redirect to the settings page with signature", async () => {
        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "get").mockImplementation(function_);
        const wallet = new WalletFactory().withoutAvatar().create();

        signedActionMock.mockImplementation((callback) => {
            callback();
        });

        render(
            <UserDetails
                wallet={wallet}
                galleriesCount={0}
                collectionCount={0}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("UserDetails__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("UserDetails__trigger"));

        expect(screen.getByTestId("UserDetails__settings")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("UserDetails__settings"));

        expect(routerSpy).toHaveBeenCalled();
    });

    it("should render without galleries", async () => {
        const wallet = new WalletFactory().withoutAvatar().create();

        environmentSpy = vi.spyOn(environmentContextMock, "useEnvironmentContext").mockReturnValue({
            ...environmentDefault,
            features: {
                ...environmentDefault.features,
                galleries: false,
            },
        });

        render(
            <UserDetails
                wallet={wallet}
                galleriesCount={0}
                collectionCount={0}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("UserDetails__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("UserDetails__trigger"));

        expect(screen.queryByTestId("AccountNavigation__galleries")).not.toBeInTheDocument();
    });

    it("should render without collection data", async () => {
        const wallet = new WalletFactory().withoutAvatar().create();

        environmentSpy = vi.spyOn(environmentContextMock, "useEnvironmentContext").mockReturnValue({
            ...environmentDefault,
            features: {
                ...environmentDefault.features,
                collections: false,
            },
        });

        render(
            <UserDetails
                wallet={wallet}
                galleriesCount={0}
                collectionCount={0}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("UserDetails__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("UserDetails__trigger"));

        expect(screen.queryByTestId("AccountNavigation__collections")).not.toBeInTheDocument();
    });

    it("should render with user avatar", () => {
        const wallet = new WalletFactory().withAvatar().create();

        render(
            <UserDetails
                galleriesCount={0}
                collectionCount={0}
                currency="USD"
                wallet={wallet}
            />,
        );

        expect(screen.getByTestId("Avatar__image")).toBeInTheDocument();

        expect(screen.getByTestId("Avatar__image")).toHaveAttribute("src", wallet.avatar.default);
    });

    it("should render with user domain", () => {
        const wallet = new WalletFactory().create({
            domain: "dashbrd.eth",
        });

        render(
            <UserDetails
                galleriesCount={0}
                collectionCount={0}
                currency="USD"
                wallet={wallet}
            />,
        );

        expect(screen.getByTestId("UserDetails__domain")).toBeInTheDocument();

        expect(screen.getByTestId("UserDetails__domain")).toHaveTextContent("dashbrd.eth");
    });

    it("should render without user domain", () => {
        const wallet = new WalletFactory().create({
            domain: null,
            address: "0x1234567890123456789012345678901234567890",
        });

        render(
            <UserDetails
                galleriesCount={0}
                collectionCount={0}
                currency="USD"
                wallet={wallet}
            />,
        );

        expect(screen.queryByTestId("UserDetails__domain")).not.toBeInTheDocument();

        expect(screen.getByTestId("UserDetails__trigger")).toHaveTextContent("0x123…67890");
    });

    it("should not add tabindex to copy button", async () => {
        render(
            <UserDetails
                wallet={wallet}
                galleriesCount={0}
                collectionCount={0}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("UserDetails__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("UserDetails__trigger"));

        expect(screen.getByTestId("UserDetails__content")).toBeInTheDocument();
        expect(screen.getByTestId("Clipboard").getElementsByTagName("button")[0]).toBeInTheDocument();
        expect(screen.getByTestId("Clipboard").getElementsByTagName("button")[0]).not.toHaveAttribute("tabindex");
    });

    it("should focus on copy button when tabbing", async () => {
        render(
            <>
                <button
                    data-testid="TestButton"
                    tabIndex={0}
                >
                    Test Button
                </button>

                <UserDetails
                    wallet={wallet}
                    galleriesCount={0}
                    collectionCount={0}
                    currency="USD"
                />
            </>,
        );

        screen.getByTestId("TestButton").focus();

        const triggerButton = screen.getAllByRole("button")[1];

        await userEvent.tab();
        await userEvent.keyboard("{Enter}");

        expect(screen.queryByTestId("UserDetails__content")).toBeInTheDocument();
        expect(triggerButton).toHaveFocus();

        await userEvent.tab();

        expect(screen.getByTestId("UserDetails__content")).toBeInTheDocument();
        expect(screen.getByTestId("Clipboard")).toBeInTheDocument();
        expect(triggerButton).not.toHaveFocus();
        expect(screen.getByTestId("Clipboard").getElementsByTagName("button")[0]).toHaveFocus();
    });

    it.each([
        ["TokenActions__send", TransactionDirection.Send],
        ["TokenActions__receive", TransactionDirection.Receive],
    ])("should open transaction slider when token actions clicked", async (button, direction) => {
        render(
            <UserDetails
                wallet={wallet}
                galleriesCount={0}
                collectionCount={0}
                currency="USD"
            />,
        );

        await userEvent.click(screen.getByTestId("UserDetails__trigger"));

        const buttonParent = within(screen.getByTestId(button));

        await userEvent.click(buttonParent.getByTestId("IconButton"));
        expect(setTransactionSliderDirection).toHaveBeenCalledWith(direction);
    });
});
