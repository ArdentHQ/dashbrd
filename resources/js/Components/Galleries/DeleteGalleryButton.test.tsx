import userEvent from "@testing-library/user-event";
import DeleteGalleryButton from "./DeleteGalleryButton";
import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import { mockInertiaUseForm, render, screen } from "@/Tests/testing-library";

describe("DeleteGalleryButton", () => {
    const gallery = new GalleryDataFactory().create();

    it("should render", () => {
        render(<DeleteGalleryButton gallery={gallery} />);

        expect(screen.getByTestId("DeleteGalleryButton")).toBeInTheDocument();
    });

    it("opens the slideout panel when pressed", async () => {
        render(<DeleteGalleryButton gallery={gallery} />);

        expect(screen.queryByTestId("ConfirmationDialog__form")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("DeleteGalleryButton"));

        expect(screen.getByTestId("ConfirmationDialog__form")).toBeInTheDocument();
    });

    it("closes the slideout panel when close button is pressed", async () => {
        render(<DeleteGalleryButton gallery={gallery} />);

        expect(screen.queryByTestId("ConfirmationDialog__form")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("DeleteGalleryButton"));

        expect(screen.getByTestId("ConfirmationDialog__form")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ConfirmationDialog__close"));

        expect(screen.queryByTestId("ConfirmationDialog__form")).not.toBeInTheDocument();
    });

    it("deletes the gallery when submitted", async () => {
        const submitFunction = vi.fn().mockImplementation((_, options) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            options?.onFinish?.();
        });

        mockInertiaUseForm({
            data: {},
            delete: submitFunction,
        });

        render(<DeleteGalleryButton gallery={gallery} />);

        await userEvent.click(screen.getByTestId("DeleteGalleryButton"));

        await userEvent.type(screen.getByTestId("ConfirmDeletionDialog__input"), "DELETE");

        await userEvent.click(screen.getByTestId("ConfirmationDialog__confirm"));

        expect(submitFunction).toHaveBeenCalled();

        expect(screen.queryByTestId("ConfirmationDialog__form")).not.toBeInTheDocument();
    });
});
