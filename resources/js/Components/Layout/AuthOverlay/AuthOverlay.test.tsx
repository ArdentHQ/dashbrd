import React from "react";
import { AuthOverlay } from "@/Components/Layout/AuthOverlay";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("AuthOverlay", () => {
    const connectWalletMock = vi.fn();
    const defaultMetamaskConfig = getSampleMetaMaskState({
        connectWallet: connectWalletMock,
    });

    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);

        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: false,
            showAuthOverlay: true,
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should connect with wallet", async () => {
        render(<AuthOverlay />);

        expect(screen.getByTestId("AuthOverlay")).toBeInTheDocument();
        expect(screen.getAllByTestId("Button")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("Button"));

        expect(connectWalletMock).toHaveBeenCalled();
    });

    it("should connect with wallet after a connection error", async () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            errorMessage: "connection error",
        });

        render(<AuthOverlay />);

        expect(screen.getByTestId("AuthOverlay")).toBeInTheDocument();
        expect(screen.getAllByTestId("Button")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("Button"));

        expect(connectWalletMock).toHaveBeenCalled();
    });

    it("should require metamask", () => {
        const needsMetamaskMessage = "Install MetaMask";

        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            needsMetaMask: true,
        });

        render(<AuthOverlay />);

        expect(screen.getByTestId("AuthOverlay")).toBeInTheDocument();
        expect(screen.getByText(needsMetamaskMessage)).toBeInTheDocument();
    });

    it("should render switching network state", () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            switching: true,
        });

        render(<AuthOverlay />);

        expect(screen.getByTestId("AuthOverlay__switching-network")).toBeInTheDocument();
    });

    it("should render connecting state", () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            connecting: true,
        });

        render(<AuthOverlay />);

        expect(screen.getByTestId("AuthOverlay__connecting-network")).toBeInTheDocument();
    });

    it("should require signature", () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            requiresSignature: true,
        });

        render(<AuthOverlay />);

        expect(screen.getByTestId("AuthOverlay__sign")).toBeInTheDocument();
    });

    it("should wait for signature on connecting state", () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            connecting: true,
            waitingSignature: true,
        });

        render(<AuthOverlay />);

        expect(screen.getByTestId("AuthOverlay__awaiting-signature")).toBeInTheDocument();
    });

    it("should render without auth overlay", () => {
        const useAuthMock = vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: true,
            showAuthOverlay: false,
        });

        render(<AuthOverlay />);

        expect(screen.queryByTestId("AuthOverlay")).not.toBeInTheDocument();
        useAuthMock.mockRestore();
    });
});
