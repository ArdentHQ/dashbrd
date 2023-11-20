import userEvent from "@testing-library/user-event";
import DeleteGalleryButton from "./DeleteGalleryButton";
import { render, screen } from "@/Tests/testing-library";

describe("DeleteGalleryButton", () => {
    it("should render", () => {
        render(<DeleteGalleryButton onDelete={vi.fn()} />);

        expect(screen.getByTestId("DeleteGalleryButton")).toBeInTheDocument();
    });

    it("handles onDelete", async () => {
        const onDelete = vi.fn();
        render(<DeleteGalleryButton onDelete={onDelete} />);

        await userEvent.click(screen.getByTestId("DeleteGalleryButton"));

        expect(onDelete).toHaveBeenCalled();
    });
});
