import React from "react";
import { DraftGalleryDeleteModal } from "./DraftGalleryDeleteModal";
import { render, screen } from "@/Tests/testing-library";

describe("DraftGalleryDeleteModal", () => {
    it("should not render if closed", () => {
        render(
            <DraftGalleryDeleteModal
                open={false}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("Dialog__panel")).not.toBeInTheDocument();
    });

    it("should render", () => {
        render(
            <DraftGalleryDeleteModal
                open={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(screen.getByTestId("Dialog__panel")).toBeInTheDocument();
    });
});
