import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import { render, screen } from "@/Tests/testing-library";
import DeleteGalleryButton from "./DeleteGalleryButton";

describe("DeleteGalleryButton", () => {
    const gallery = new GalleryDataFactory().create();

    it("should render", () => {
        render(<DeleteGalleryButton gallery={gallery} />);

        expect(screen.getByTestId("DeleteGalleryButton")).toBeInTheDocument();
    });
});
