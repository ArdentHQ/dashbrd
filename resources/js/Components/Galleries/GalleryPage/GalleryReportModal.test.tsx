import { router } from "@inertiajs/react";
import React from "react";
import { type SpyInstance } from "vitest";
import { GalleryReportModal } from "@/Components/Galleries/GalleryPage/GalleryReportModal";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { fireEvent, mockInertiaUseForm, render, screen, userEvent } from "@/Tests/testing-library";
const gallery = new GalleryDataFactory().create();

const reportButton = (): HTMLElement => screen.getByTestId("GalleryControls__flag-button");

const renderAndOpenDialog = async (reportReasons?: Record<string, string>): Promise<void> => {
    render(
        <GalleryReportModal
            gallery={gallery}
            reportReasons={reportReasons}
        />,
    );

    expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();

    const triggerButton = reportButton();

    await userEvent.click(triggerButton);
};

const defaultMetamaskConfig = getSampleMetaMaskState();

const user = new UserDataFactory().create();
const wallet = new WalletFactory().create();

let useMetamaskSpy: SpyInstance;
let useAuthSpy: SpyInstance;

describe("GalleryReportModal", () => {
    beforeEach(() => {
        useMetamaskSpy = vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);

        useAuthSpy = vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user,
            wallet,
            authenticated: true,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });
    });

    afterEach(() => {
        useMetamaskSpy.mockRestore();
        useAuthSpy.mockRestore();
    });

    it("should render when opened", async () => {
        await renderAndOpenDialog();
    });

    it("can be closed", async () => {
        const routerSpy = vi.spyOn(router, "reload").mockImplementation(() => vi.fn());

        await renderAndOpenDialog();

        const closeButton = screen.getByTestId("ConfirmationDialog__close");

        fireEvent.click(closeButton);

        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();

        expect(routerSpy).toHaveBeenCalled();

        routerSpy.mockRestore();
    });

    it("opens the modal if param passed", async () => {
        render(
            <GalleryReportModal
                gallery={gallery}
                show={true}
            />,
        );

        expect(screen.queryByTestId("ReportModal")).toBeInTheDocument();
    });

    it("disables the button with isDisabled prop", () => {
        render(
            <GalleryReportModal
                gallery={gallery}
                isDisabled
            />,
        );

        expect(reportButton()).toBeDisabled();
    });

    it("disables the button if alreadyReported", () => {
        render(
            <GalleryReportModal
                gallery={gallery}
                alreadyReported
            />,
        );

        expect(reportButton()).toBeDisabled();
    });

    it("disables the button if reportAvailableIn message", () => {
        render(
            <GalleryReportModal
                gallery={gallery}
                reportAvailableIn="1 day"
            />,
        );

        expect(reportButton()).toBeDisabled();
    });

    it("can be submitted with a valid reason", async () => {
        const data: Record<string, unknown> = {
            reason: "first",
        };

        const postFunction = vi.fn();

        mockInertiaUseForm({
            data,
            setData: (key, value) => {
                data[key] = value;
            },
            post: postFunction,
        });

        await renderAndOpenDialog({
            reason1: "lorem ipsum",
            reason2: "lorem ipsum",
        });

        const radioButtons = screen.getAllByTestId("ReportModal__radio");

        fireEvent.click(radioButtons[0]);

        const submitButton = screen.getByTestId("ConfirmationDialog__confirm");

        fireEvent.click(submitButton);

        expect(postFunction).toHaveBeenCalled();
    });

    it("opens auth overlay if no authenticated", async () => {
        useAuthSpy = vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: false,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });

        const showConnectOverlay = vi.fn();

        useMetamaskSpy = vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(
            getSampleMetaMaskState({
                showConnectOverlay,
            }),
        );

        await renderAndOpenDialog({
            reason1: "lorem ipsum",
            reason2: "lorem ipsum",
        });

        expect(showConnectOverlay).toHaveBeenCalled();
    });

    it("opens the modal after logged in", async () => {
        const routerSpy = vi.spyOn(router, "reload").mockImplementation(() => vi.fn());

        useAuthSpy = vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: false,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });

        const showConnectOverlay = vi.fn().mockImplementation((callback) => {
            callback();
        });

        useMetamaskSpy = vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(
            getSampleMetaMaskState({
                showConnectOverlay,
            }),
        );

        await renderAndOpenDialog({
            reason1: "lorem ipsum",
            reason2: "lorem ipsum",
        });

        expect(showConnectOverlay).toHaveBeenCalled();

        expect(routerSpy).toHaveBeenCalled();
    });

    it("can be submitted without a gallery", () => {
        const data: Record<string, unknown> = {
            reason: "first",
        };

        const postFunction = vi.fn();

        mockInertiaUseForm({
            data,
            setData: (key, value) => {
                data[key] = value;
            },
            post: postFunction,
        });

        render(<GalleryReportModal />);

        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();

        fireEvent.click(reportButton());

        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();

        expect(postFunction).not.toHaveBeenCalled();
    });

    it("can show an error message if something went wrong trying to report", async () => {
        const data: Record<string, unknown> = {
            reason: "first",
        };

        mockInertiaUseForm({
            data,
            setData: (key, value) => {
                data[key] = value;
            },
            post: (url, options) => {
                options?.onError?.({ error: "error" });
            },
        });

        await renderAndOpenDialog({
            reason: "reason",
        });

        const radioButtons = screen.getAllByTestId("ReportModal__radio");

        fireEvent.click(radioButtons[0]);

        const submitButton = screen.getByTestId("ConfirmationDialog__confirm");

        fireEvent.click(submitButton);

        expect(screen.getByTestId("ReportModal__failed")).toBeInTheDocument();
    });
});
