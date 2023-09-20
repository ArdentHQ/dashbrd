import React from "react";
import { TokenDetailsSlider } from "@/Components/Tokens/TokenDetailsSlider";
import * as MetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import TokenTransactionsFixture from "@/Tests/Fixtures/token_transactions.json";
import { setNativeTokenHandler } from "@/Tests/Mocks/Handlers/nativeToken";
import { requestMock, server } from "@/Tests/Mocks/server";
import { useTransactionSliderContextSpy } from "@/Tests/Spies/useTransactionSliderContextSpy";
import { render, screen, userEvent, waitFor, within } from "@/Tests/testing-library";

const user = new UserDataFactory().create();
const asset = new TokenListItemDataFactory().create({
    chain_id: 137,
    is_native_token: true,
});

const wallet = new WalletFactory().create();

const mockMetaMask = (overrides = {}): void => {
    vi.spyOn(MetaMaskContext, "useMetaMaskContext").mockImplementation(() => ({
        account: "test-address",
        chainId: 137,
        connectWallet: async (): Promise<void> => {
            await new Promise(vi.fn());
        },
        connecting: true,
        initialized: true,
        needsMetaMask: false,
        supportsMetaMask: true,
        waitingSignature: false,
        errorMessage: "",
        requiresSignature: false,
        switching: false,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ethereumProvider: {
            getNetwork: vi.fn().mockReturnValue({
                chainId: 137,
            }),
        },
        ...overrides,
    }));
};

describe("TokenDetailsSlider", () => {
    useTransactionSliderContextSpy();

    beforeAll(() => {
        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user,
            wallet: null,
            authenticated: true,
            signed: false,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });
    });

    beforeEach(() => {
        server.use(
            requestMock("https://api.polygonscan.com/api", TokenTransactionsFixture, {
                method: "get",
            }),
        );

        setNativeTokenHandler();
    });

    it("does not render if asset does not exist", () => {
        render(
            <TokenDetailsSlider
                open
                onClose={vi.fn()}
                user={user}
                wallet={wallet}
            />,
        );

        expect(screen.getByTestId("TokenDetailsSlider")).toBeInTheDocument();

        expect(screen.queryByTestId("TokenDetailsSlider__content")).not.toBeInTheDocument();
    });

    it("should render", async () => {
        mockMetaMask();

        render(
            <TokenDetailsSlider
                wallet={wallet}
                asset={asset}
                open
                onClose={vi.fn()}
                user={user}
            />,
        );

        expect(screen.getByTestId("TokenDetailsSlider")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("TokenDetailsSlider__header")).toBeInTheDocument();

            expect(screen.queryByTestId("TokenDetailsSlider__loader")).not.toBeInTheDocument();
            expect(screen.queryByTestId("TokenDetailsSlider__error")).not.toBeInTheDocument();

            expect(screen.getByTestId("TokenDetailsSlider__content")).toBeInTheDocument();
        });
    });

    it("should render closed", () => {
        render(
            <TokenDetailsSlider
                wallet={wallet}
                open={false}
                onClose={vi.fn()}
                asset={asset}
                user={user}
            />,
        );

        expect(screen.queryByTestId("TokenDetailsSlider")).not.toBeInTheDocument();
    });

    it("closes the slider", async () => {
        const onClose = vi.fn();
        render(
            <TokenDetailsSlider
                asset={asset}
                open
                onClose={onClose}
                user={user}
                wallet={wallet}
            />,
        );

        expect(screen.getByTestId("TokenDetailsSlider")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("TokenDetailsSlider__header")).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId("Slider__closeButton_desktop"));

        expect(onClose).toHaveBeenCalled();
    });

    it("should handle onSend event", async () => {
        const onSend = vi.fn();

        render(
            <TokenDetailsSlider
                asset={asset}
                open
                onClose={vi.fn()}
                onSend={onSend}
                user={user}
                wallet={wallet}
            />,
        );

        expect(screen.getByTestId("TokenDetailsSlider")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("TokenDetailsSlider__header")).toBeInTheDocument();

            expect(screen.queryByTestId("TokenDetailsSlider__loader")).not.toBeInTheDocument();
            expect(screen.queryByTestId("TokenDetailsSlider__error")).not.toBeInTheDocument();

            expect(screen.getByTestId("TokenDetailsSlider__content")).toBeInTheDocument();
        });

        const sendButton = within(screen.getByTestId("TokenActions__send")).getByTestId("IconButton");
        expect(sendButton).toBeInTheDocument();

        await userEvent.click(sendButton);
        expect(onSend).toHaveBeenCalled();
    });

    it("should handle onReceive event", async () => {
        mockMetaMask();

        const onReceive = vi.fn();

        render(
            <TokenDetailsSlider
                asset={asset}
                open
                onClose={vi.fn()}
                onReceive={onReceive}
                user={user}
                wallet={wallet}
            />,
        );

        expect(screen.getByTestId("TokenDetailsSlider")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("TokenDetailsSlider__header")).toBeInTheDocument();

            expect(screen.queryByTestId("TokenDetailsSlider__loader")).not.toBeInTheDocument();
            expect(screen.queryByTestId("TokenDetailsSlider__error")).not.toBeInTheDocument();

            expect(screen.getByTestId("TokenDetailsSlider__content")).toBeInTheDocument();
        });

        const sendButton = within(screen.getByTestId("TokenActions__receive")).getByTestId("IconButton");
        expect(sendButton).toBeInTheDocument();

        await userEvent.click(sendButton);
        expect(onReceive).toHaveBeenCalled();
    });
});
