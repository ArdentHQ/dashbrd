import { router } from "@inertiajs/react";
import React from "react";
import { type SpyInstance } from "vitest";
import { GalleryReportModal } from "@/Components/Galleries/GalleryPage/GalleryReportModal";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import { fireEvent, mockInertiaUseForm, render, screen, userEvent, waitFor } from "@/Tests/testing-library";
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

let useAuthorizedActionSpy: SpyInstance;
const signedActionMock = vi.fn();

describe("GalleryReportModal", () => {
    beforeEach(() => {
        signedActionMock.mockImplementation((action) => {
            action({ authenticated: true, signed: true });
        });

        useAuthorizedActionSpy = vi.spyOn(useAuthorizedActionMock, "useAuthorizedAction").mockReturnValue({
            signedAction: signedActionMock,
        });
    });

    afterEach(() => {
        useAuthorizedActionSpy.mockRestore();
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

        await waitFor(() => {
            expect(screen.queryByTestId("ReportModal")).toBeInTheDocument();
        });
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

    it("requires signed action to open modal", async () => {
        const routerSpy = vi.spyOn(router, "reload").mockImplementation(() => vi.fn());
        await renderAndOpenDialog({
            reason1: "lorem ipsum",
            reason2: "lorem ipsum",
        });

        expect(signedActionMock).toHaveBeenCalled();
        expect(routerSpy).not.toHaveBeenCalled();
        routerSpy.mockRestore();
    });

    it("reloads if user was not signed", async () => {
        const routerSpy = vi.spyOn(router, "reload").mockImplementation(() => vi.fn());

        signedActionMock.mockImplementation((action) => {
            action({ authenticated: false, signed: false });
        });

        await renderAndOpenDialog({
            reason1: "lorem ipsum",
            reason2: "lorem ipsum",
        });

        expect(signedActionMock).toHaveBeenCalled();
        expect(routerSpy).toHaveBeenCalled();
        routerSpy.mockRestore();
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
