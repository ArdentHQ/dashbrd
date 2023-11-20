import { expect } from "vitest";
import { GalleryDraftStatus } from "@/Components/Galleries/GalleryPage/GalleryActionToolbar/GalleryDraftStatus";
import { render, screen } from "@/Tests/testing-library";

describe("GalleryDraftStatus", () => {
    it("should show draft saved status", () => {
        render(
            <GalleryDraftStatus
                draftId={1}
                isSavingDraft={false}
            />,
        );

        expect(screen.getByText(/Draft Saved/)).toBeInTheDocument();
    });

    it("should show saving status", () => {
        render(
            <GalleryDraftStatus
                draftId={1}
                isSavingDraft={true}
            />,
        );

        expect(screen.getByText(/Saving to draft/)).toBeInTheDocument();
    });

    it("should not render any status message", () => {
        render(<GalleryDraftStatus />);

        expect(screen.queryByText(/Saving to draft/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Draft Saved/)).not.toBeInTheDocument();
    });
});
