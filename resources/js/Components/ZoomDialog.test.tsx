import { ZoomDialog } from "./ZoomDialog";
import { render, screen } from "@/Tests/testing-library";

describe("ZoomDialog", () => {
    it("should render", () => {
        render(
            <ZoomDialog
                isOpen={true}
                onClose={vi.fn()}
            >
                <div>Content</div>
            </ZoomDialog>,
        );

        expect(screen.getByTestId("Dialog")).toBeInTheDocument();
    });

    it("should render children", () => {
        render(
            <ZoomDialog
                isOpen={true}
                onClose={vi.fn()}
            >
                <div>Content</div>
            </ZoomDialog>,
        );

        expect(screen.getByText("Content")).toBeInTheDocument();
    });
});
