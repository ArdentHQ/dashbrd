import DeleteGalleryButton from "./DeleteGalleryButton";
import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import { render, screen } from "@/Tests/testing-library";

describe("DeleteGalleryButton", () => {
    const gallery = new GalleryDataFactory().create();

    it("should render", () => {
        render(<DeleteGalleryButton gallery={gallery} />);

        expect(screen.getByTestId("DeleteGalleryButton")).toBeInTheDocument();
    });
});
