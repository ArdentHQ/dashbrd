import React from "react";
import { Dialog } from "./Dialog";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("Dialog", () => {
    it("should render", () => {
        render(
            <Dialog
                isOpen
                title="test"
                onClose={vi.fn()}
            >
                <div data-testid="content"></div>
            </Dialog>,
        );

        expect(screen.getByTestId("Dialog")).toBeInTheDocument();
        expect(screen.getByTestId("content")).toBeInTheDocument();
        expect(screen.getByTestId("Dialog__close")).toBeInTheDocument();
    });

    it("should render with enabled `isUsedByConfirmationDialog` property", () => {
        render(
            <Dialog
                isOpen
                title="test"
                onClose={vi.fn()}
                isUsedByConfirmationDialog
            >
                <div data-testid="content"></div>
            </Dialog>,
        );

        expect(screen.getByTestId("Dialog")).toBeInTheDocument();
        expect(screen.getByTestId("content")).toBeInTheDocument();
        expect(screen.getByTestId("Dialog__close")).toBeInTheDocument();
    });

    it("should render static", () => {
        const reference = {
            current: document.createElement("div"),
        };

        render(
            <Dialog
                isOpen
                isStatic
                title="test"
                onClose={vi.fn()}
                isUsedByConfirmationDialog
                focus={reference}
            >
                <div data-testid="content"></div>
            </Dialog>,
        );

        expect(screen.getByTestId("Dialog")).toBeInTheDocument();
        expect(screen.getByTestId("content")).toBeInTheDocument();
        expect(screen.queryByTestId("Dialog__close")).not.toBeInTheDocument();
    });

    it("should open and close modal", async () => {
        const onClose = vi.fn();
        render(
            <Dialog
                isOpen
                title="test"
                onClose={onClose}
            >
                <div data-testid="content"></div>
            </Dialog>,
        );

        expect(screen.getByTestId("content")).toBeInTheDocument();
        expect(screen.getByTestId("Dialog")).toBeInTheDocument();
        expect(screen.getByTestId("Dialog__overlay")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Dialog__overlay"));

        expect(onClose).toHaveBeenCalled();
    });

    it("should render custom class names for the panel", () => {
        render(
            <Dialog
                isOpen
                title="test"
                onClose={vi.fn()}
                panelClassName="custom-class"
            >
                <div data-testid="content"></div>
            </Dialog>,
        );

        expect(screen.getByTestId("Dialog__panel")).toHaveClass("custom-class");
    });
});
