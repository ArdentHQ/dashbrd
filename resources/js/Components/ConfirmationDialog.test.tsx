import React from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("ConfirmationDialog", () => {
    it("should render", () => {
        render(
            <ConfirmationDialog
                isOpen
                title="test"
                confirmLabel="confirm"
                onConfirm={vi.fn()}
                onClose={vi.fn()}
            >
                <div data-testid="content"></div>
            </ConfirmationDialog>,
        );

        expect(screen.getByTestId("ConfirmationDialog__form")).toBeInTheDocument();
        expect(screen.getByTestId("ConfirmationDialog__confirm")).toBeInTheDocument();
        expect(screen.getByTestId("ConfirmationDialog__close")).toBeInTheDocument();
        expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("should render static", () => {
        render(
            <ConfirmationDialog
                isOpen
                isStatic
                title="test"
                confirmLabel="confirm"
                onConfirm={vi.fn()}
                onClose={vi.fn()}
            >
                <div data-testid="content"></div>
            </ConfirmationDialog>,
        );

        expect(screen.getByTestId("content")).toBeInTheDocument();

        expect(screen.queryByTestId("ConfirmationDialog__close")).not.toBeInTheDocument();
    });

    it("should submit", async () => {
        const confirmMock = vi.fn();

        render(
            <ConfirmationDialog
                isOpen
                title="test"
                confirmLabel="confirm"
                onConfirm={confirmMock}
                onClose={vi.fn()}
            >
                <div data-testid="content"></div>
            </ConfirmationDialog>,
        );

        expect(screen.getByTestId("ConfirmationDialog__confirm")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ConfirmationDialog__confirm"));

        expect(confirmMock).toHaveBeenCalledWith();
    });
});
