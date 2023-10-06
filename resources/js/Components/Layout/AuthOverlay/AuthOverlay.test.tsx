import React from "react";
import { AuthOverlay } from "@/Components/Layout/AuthOverlay";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { fireEvent, render, screen, userEvent } from "@/Tests/testing-library";

describe("AuthOverlay", () => {
    const connectWalletMock = vi.fn();
    const signWalletSpy = vi.fn();
    const defaultMetamaskConfig = getSampleMetaMaskState({
        connectWallet: connectWalletMock,
        signWallet: signWalletSpy,
    });

    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should connect with wallet", async () => {
        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("AuthOverlay__close-button")).not.toBeInTheDocument();
        expect(screen.getByTestId("AuthOverlay")).toBeInTheDocument();
        expect(screen.getAllByTestId("Button")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("Button"));

        expect(connectWalletMock).toHaveBeenCalled();
    });

    it("should sign if requires signature", async () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            requiresSignature: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("AuthOverlay__close-button")).not.toBeInTheDocument();
        expect(screen.getByTestId("AuthOverlay")).toBeInTheDocument();
        expect(screen.getAllByTestId("Button")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("Button"));

        expect(signWalletSpy).toHaveBeenCalled();
    });

    it("should sign if must be signed prop", async () => {
        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
                mustBeSigned={true}
            />,
        );

        expect(screen.queryByTestId("AuthOverlay__close-button")).not.toBeInTheDocument();
        expect(screen.getByTestId("AuthOverlay")).toBeInTheDocument();
        expect(screen.getAllByTestId("Button")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("Button"));

        expect(signWalletSpy).toHaveBeenCalled();
    });

    it("should connect with wallet and show close button", async () => {
        render(
            <AuthOverlay
                show={true}
                showCloseButton={true}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.getByTestId("AuthOverlay__close-button")).toBeInTheDocument();
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

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("AuthOverlay__close-button")).not.toBeInTheDocument();
        expect(screen.getByTestId("AuthOverlay")).toBeInTheDocument();
        expect(screen.getAllByTestId("Button")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("Button"));

        expect(connectWalletMock).toHaveBeenCalled();
    });

    it("should connect with wallet after a connection error and show close button", async () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            errorMessage: "connection error",
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={true}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.getByTestId("AuthOverlay__close-button")).toBeInTheDocument();
        expect(screen.getByTestId("AuthOverlay")).toBeInTheDocument();
        expect(screen.getAllByTestId("Button")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("Button"));

        expect(connectWalletMock).toHaveBeenCalled();
    });

    it("should ask for signature after signing error and show close button", async () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            errorMessage: "connection error",
            requiresSignature: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={true}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.getByTestId("ConnectionError")).toBeInTheDocument();
        expect(screen.getByTestId("AuthOverlay__close-button")).toBeInTheDocument();
        expect(screen.getByTestId("AuthOverlay")).toBeInTheDocument();
        expect(screen.getAllByTestId("Button")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("Button"));

        expect(signWalletSpy).toHaveBeenCalled();
    });

    it("should require metamask", () => {
        const needsMetamaskMessage = "Install MetaMask";

        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            needsMetaMask: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("AuthOverlay__close-button")).not.toBeInTheDocument();
        expect(screen.getByTestId("AuthOverlay")).toBeInTheDocument();
        expect(screen.getByText(needsMetamaskMessage)).toBeInTheDocument();
    });

    it("should require metamask and show close button", () => {
        const needsMetamaskMessage = "Install MetaMask";

        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            needsMetaMask: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={true}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.getByTestId("AuthOverlay__close-button")).toBeInTheDocument();
        expect(screen.getByText(needsMetamaskMessage)).toBeInTheDocument();
    });

    it("should render switching network state", () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            switching: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.getByTestId("AuthOverlay__switching-network")).toBeInTheDocument();
    });

    it("should render connecting state", () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            connecting: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.getByTestId("AuthOverlay__connecting-network")).toBeInTheDocument();
    });

    it("should render signing state if signing", () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            signing: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.getByTestId("AuthOverlay__connecting-network")).toBeInTheDocument();
    });

    it("should require signature", () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            requiresSignature: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.getByTestId("AuthOverlay__sign")).toBeInTheDocument();
    });

    it("should wait for signature on connecting state", () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            connecting: true,
            waitingSignature: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.getByTestId("AuthOverlay__awaiting-signature")).toBeInTheDocument();
    });

    it("should render without auth overlay", () => {
        render(
            <AuthOverlay
                show={false}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("AuthOverlay")).not.toBeInTheDocument();
    });

    it("should render without back button if showBackButton is false", () => {
        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={false}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("AuthOverlay__back-button")).not.toBeInTheDocument();
    });

    it("should render back button if showBackButton is true", () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            requiresSignature: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={true}
                closeOverlay={vi.fn()}
            />,
        );

        expect(screen.getByTestId("AuthOverlay__back-button")).toBeInTheDocument();
    });

    it("should redirect to page if referrer is null", () => {
        vi.spyOn(document, "referrer", "get").mockReturnValue("");
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            requiresSignature: true,
        });

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={true}
                closeOverlay={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId("AuthOverlay__back-button"));
        expect(window.location.href).toContain("/");
    });

    it("should redirect to previous page if referrer is not null", () => {
        vi.spyOn(document, "referrer", "get").mockReturnValue("http://localhost:3000/");
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            requiresSignature: true,
        });
        const backSpy = vi.spyOn(window.history, "back");

        render(
            <AuthOverlay
                show={true}
                showCloseButton={false}
                showBackButton={true}
                closeOverlay={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId("AuthOverlay__back-button"));
        expect(backSpy).toHaveBeenCalled();
    });
});
