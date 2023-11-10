import { DraftsLimitDialog } from "./DraftsLimitDialog";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("ConfirmDeletionDialog", () => {
    it("should render correctly", () => {
        render(
            <DraftsLimitDialog
                isOpen={true}
                onClose={vi.fn()}
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
                title="Test Title"
            >
                Test children
            </DraftsLimitDialog>,
        );

        expect(screen.getByText("Test Title")).toBeInTheDocument();
        expect(screen.getByText("Test children")).toBeInTheDocument();
    });

    it("should call onCancel when cancel button is clicked", async () => {
        const onCancelMock = vi.fn();

        render(
            <DraftsLimitDialog
                isOpen={true}
                onClose={vi.fn()}
                onCancel={onCancelMock}
                onConfirm={vi.fn()}
                title="Test Title"
            >
                Test children
            </DraftsLimitDialog>,
        );

        const cancelButton = screen.getByTestId("ConfirmationDialog__close");

        await userEvent.click(cancelButton);

        expect(onCancelMock).toHaveBeenCalled();
    });

    it("should call onConfirm when confirm button is clicked", async () => {
        const onConfirmMock = vi.fn();

        const { getByTestId } = render(
            <DraftsLimitDialog
                isOpen={true}
                onClose={vi.fn()}
                onCancel={vi.fn()}
                onConfirm={onConfirmMock}
                title="Test Title"
            >
                Test children
            </DraftsLimitDialog>,
        );

        const confirmButton = getByTestId("ConfirmationDialog__confirm");

        await userEvent.click(confirmButton);

        expect(onConfirmMock).toHaveBeenCalled();
    });
});
