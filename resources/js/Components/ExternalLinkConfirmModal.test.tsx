import { ExternalLinkConfirmModal } from "@/Components/ExternalLinkConfirmModal";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("ExternalLinkConfirmModal", () => {
    it("renders correctly", () => {
        render(
            <ExternalLinkConfirmModal
                isOpen={true}
                onClose={vi.fn()}
                href={"https://duhverse.com"}
            />,
        );

        expect(screen.getByTestId("Toast")).toBeInTheDocument();
        expect(screen.getByTestId("ExternalLinkConfirmModal__info")).toBeInTheDocument();
        expect(screen.getByTestId("Checkbox")).toBeInTheDocument();
    });

    it("can check: do not show this message again", async () => {
        render(
            <ExternalLinkConfirmModal
                isOpen={true}
                onClose={vi.fn()}
                href={"https://duhverse.com"}
            />,
        );

        const checkbox = screen.getByTestId<HTMLInputElement>("Checkbox");
        await userEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);
    });

    it("can follow link", async () => {
        const onCloseMock = vi.fn();

        render(
            <ExternalLinkConfirmModal
                isOpen={true}
                onClose={onCloseMock}
                href={"https://duhverse.com"}
            />,
        );

        const confirmButton = screen.getByTestId("ConfirmationDialog__confirm");
        await userEvent.click(confirmButton);
        expect(onCloseMock).toHaveBeenCalled();
    });

    it("can follow link and disabled warning", async () => {
        const onCloseMock = vi.fn();

        render(
            <ExternalLinkConfirmModal
                isOpen={true}
                onClose={onCloseMock}
                href={"https://duhverse.com"}
            />,
        );

        await userEvent.click(screen.getByTestId("Checkbox"));

        const confirmButton = screen.getByTestId("ConfirmationDialog__confirm");
        await userEvent.click(confirmButton);
        expect(onCloseMock).toHaveBeenCalled();
    });
});
