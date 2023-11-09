import { ConfirmDeletionDialog } from "./ConfirmDeletionDialog";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";

describe("ConfirmDeletionDialog", () => {
    it("renders correctly", async () => {
        render(
            <ConfirmDeletionDialog
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Test Title"
            >
                Test children
            </ConfirmDeletionDialog>,
        );

        expect(screen.getByText("Test Title")).toBeInTheDocument();
        expect(screen.getByText("Test children")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId("ConfirmDeletionDialog__input")).toBeInTheDocument();
        });
    });

    it("calls onClose when cancel button is clicked", async () => {
        const onCloseMock = vi.fn();

        render(
            <ConfirmDeletionDialog
                isOpen={true}
                onClose={onCloseMock}
                onConfirm={vi.fn()}
                title="Test Title"
            >
                Test children
            </ConfirmDeletionDialog>,
        );

        const cancelButton = screen.getByTestId("ConfirmationDialog__close");

        await userEvent.click(cancelButton);

        expect(onCloseMock).toHaveBeenCalled();
    });

    it("disables confirm button when input value is not DELETE", async () => {
        const { getByTestId } = render(
            <ConfirmDeletionDialog
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Test Title"
            >
                Test children
            </ConfirmDeletionDialog>,
        );

        const confirmButton = getByTestId("ConfirmationDialog__confirm");
        const confirmationInput = getByTestId("ConfirmDeletionDialog__input");

        expect(confirmButton).toBeDisabled();

        await userEvent.type(confirmationInput, "NOTDELETE");

        expect(confirmButton).toBeDisabled();

        await userEvent.clear(confirmationInput);
        await userEvent.type(confirmationInput, "DELETE");

        expect(confirmButton).toBeEnabled();
    });

    it("calls onConfirm when confirm button is clicked", async () => {
        const onConfirmMock = vi.fn();

        const { getByTestId } = render(
            <ConfirmDeletionDialog
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={onConfirmMock}
                title="Test Title"
            >
                Test children
            </ConfirmDeletionDialog>,
        );

        const confirmButton = getByTestId("ConfirmationDialog__confirm");
        const confirmationInput = getByTestId("ConfirmDeletionDialog__input");

        await userEvent.type(confirmationInput, "DELETE");
        await userEvent.click(confirmButton);

        expect(onConfirmMock).toHaveBeenCalled();
    });

     vi.useFakeTimers({ shouldAdvanceTime: true });
    it("removes the confirmation input text when modal is closed", async () => {
        const { getByTestId, rerender } = render(
            <ConfirmDeletionDialog
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Test Title"
            >
                Test children
            </ConfirmDeletionDialog>,
        );

        let confirmationInput = getByTestId("ConfirmDeletionDialog__input");

        await userEvent.type(confirmationInput, "DELETE");

        expect(confirmationInput).toHaveValue("DELETE");

        rerender(
            <ConfirmDeletionDialog
                isOpen={false}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Test Title"
            >
                Test children
            </ConfirmDeletionDialog>,
        );

        rerender(
            <ConfirmDeletionDialog
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Test Title"
            >
                Test children
            </ConfirmDeletionDialog>,
        );

        confirmationInput = getByTestId("ConfirmDeletionDialog__input");

        await waitFor(() => {
            expect(confirmationInput).toHaveValue("");
        });
    });
});
